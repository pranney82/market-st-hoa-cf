import { useState, useEffect, useRef } from "react";

interface Props {
  isEnabled: boolean;
  duesAmount: number;
}

declare global {
  interface Window {
    appendHelcimPayIframe?: (config: { checkoutToken: string }) => void;
  }
}

export default function AutopaySetup({ isEnabled, duesAmount }: Props) {
  const [enabled, setEnabled] = useState(isEnabled);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const secretTokenRef = useRef("");

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
      } catch {
        return;
      }

      if (data.eventName === "helcim-pay-success" && secretTokenRef.current) {
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
            setEnabled(true);
            setSuccess("Autopay is now active! Your dues will be charged automatically each month.");
            setError("");
            secretTokenRef.current = "";
          } else {
            setError(result.error || "Failed to activate autopay");
          }
        } catch {
          setError("Failed to complete autopay setup");
        }
        setLoading(false);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  async function startSetup() {
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
        setError(data.error || "Failed to initialize autopay");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel autopay? You'll need to pay manually each month.")) return;

    setCancelling(true);
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
        setEnabled(false);
        setSuccess("Autopay has been cancelled.");
      } else {
        setError(result.error || "Failed to cancel autopay");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Autopay</h3>
          <p className="text-sm text-gray-500">Set up automatic monthly dues payments</p>
        </div>
      </div>

      {enabled ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700">
              Autopay is active — ${duesAmount.toFixed(2)}/month charged automatically.
            </p>
          </div>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel Autopay"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Autopay automatically charges ${duesAmount.toFixed(2)} on the 1st of each month for your monthly dues.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Secure payment processing powered by Helcim. Accepts: Credit/Debit Cards · ACH Bank Transfer
          </div>
          <p className="text-xs text-gray-400">
            Your payment information is encrypted and secure. Credit card processing fees are passed to members. We never store your card details.
          </p>
          <button
            onClick={startSetup}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Processing..." : "Set Up Autopay"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-600">{success}</p>}
    </div>
  );
}
