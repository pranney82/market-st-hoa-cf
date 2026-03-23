import { useState, useEffect, useRef } from "react";

interface Props {
  amount: number;
  userId: string;
}

declare global {
  interface Window {
    appendHelcimPayIframe?: (config: { checkoutToken: string }) => void;
  }
}

export default function PaymentCheckout({ amount: initialAmount, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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
      } catch { return; }
      if (data.eventName === "helcim-pay-success") {
        try {
          const res = await fetch("/api/payments/complete-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId: data.transactionId, secretToken: secretTokenRef.current }),
          });
          if (res.ok) {
            setSuccess(true);
            setTimeout(() => window.location.reload(), 2000);
          } else {
            const err = await res.json();
            setError(err.error || "Payment verification failed");
          }
        } catch {
          setError("Failed to verify payment");
        }
        setLoading(false);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  async function startCheckout() {
    setLoading(true);
    setError("");

    try {
      // Server calculates amount from actual dues owed
      const res = await fetch("/api/payments/initialize-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.checkoutToken && window.appendHelcimPayIframe) {
        secretTokenRef.current = data.secretToken || "";
        window.appendHelcimPayIframe({ checkoutToken: data.checkoutToken });
      } else {
        setError(data.error || "Failed to initialize payment");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <p className="text-green-700 font-medium">Payment successful! Refreshing...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Total Balance Due</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${initialAmount.toFixed(2)}</p>
        </div>
        <button
          onClick={startCheckout}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
