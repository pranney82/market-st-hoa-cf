import { useState, useEffect, useRef } from "react";

interface Props {
  enabled: boolean;
  cardLast4?: string | null;
  cardType?: string | null;
  bankLast4?: string | null;
  bankName?: string | null;
}

declare global {
  interface Window {
    appendHelcimPayIframe?: (config: { checkoutToken: string }) => void;
  }
}

export default function AutopayManager({ enabled, cardLast4, cardType, bankLast4, bankName }: Props) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const secretTokenRef = useRef("");

  // Load Helcim JS if not already loaded
  useEffect(() => {
    if (!document.getElementById("helcim-pay-js")) {
      const script = document.createElement("script");
      script.id = "helcim-pay-js";
      script.src = "https://js.helcim.com/helcim-pay/services/start.js";
      document.head.appendChild(script);
    }

    const handler = async (e: MessageEvent) => {
      let data: Record<string, unknown>;
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch { return; }

      if (data.eventName === "helcim-pay-success" && secretTokenRef.current) {
        // Card/bank captured — now subscribe
        try {
          const res = await fetch("/api/payments/autopay-subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerCode: data.customerCode,
              secretToken: secretTokenRef.current,
              cardLast4: (data.cardNumber as string)?.slice(-4) || null,
              cardType: data.cardType || null,
              bankLast4: (data.bankAccountNumber as string)?.slice(-4) || null,
              bankName: data.bankName || null,
            }),
          });
          const result = await res.json();
          if (res.ok) {
            setIsEnabled(true);
            setSuccess("Autopay enabled! Your dues will be charged automatically each month.");
            secretTokenRef.current = "";
          } else {
            setError(result.error || "Failed to enable autopay");
          }
        } catch {
          setError("Something went wrong");
        }
        setLoading(false);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  async function setupAutopay() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/payments/autopay-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.checkoutToken && window.appendHelcimPayIframe) {
        secretTokenRef.current = data.secretToken || "";
        window.appendHelcimPayIframe({ checkoutToken: data.checkoutToken });
      } else {
        setError(data.error || "Failed to start autopay setup");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  async function cancelAutopay() {
    if (!confirm("Cancel autopay? You'll need to pay dues manually each month.")) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/payments/autopay-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = await res.json();
      if (res.ok) {
        setIsEnabled(false);
        setSuccess("Autopay cancelled.");
      } else {
        setError(result.error || "Failed to cancel autopay");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const paymentLabel = cardLast4
    ? `${cardType || "Card"} ending in ${cardLast4}`
    : bankLast4
      ? `${bankName || "Bank"} ending in ${bankLast4}`
      : null;

  return (
    <div>
      {isEnabled ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              Active
            </span>
          </div>
          {paymentLabel && (
            <p className="text-sm text-gray-600 mb-3">{paymentLabel}</p>
          )}
          <p className="text-sm text-gray-500 mb-4">Your monthly dues are charged automatically. You'll receive an email receipt after each payment.</p>
          <button
            onClick={cancelAutopay}
            disabled={loading}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            {loading ? "Cancelling..." : "Cancel Autopay"}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-4">Set up automatic monthly payments so you never miss a due date. Your card or bank account will be charged on the 1st of each month.</p>
          <button
            onClick={setupAutopay}
            disabled={loading}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Setting up..." : "Set Up Autopay"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-600">{success}</p>}
    </div>
  );
}
