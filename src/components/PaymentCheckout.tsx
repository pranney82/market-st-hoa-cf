import { useState } from "react";

interface Props {
  amount: number;
  userId: string;
}

export default function PaymentCheckout({ amount, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/initialize-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, userId }),
      });
      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || "Failed to initialize payment");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Total Balance Due</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${amount.toFixed(2)}</p>
        </div>
        <button
          onClick={startCheckout}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
