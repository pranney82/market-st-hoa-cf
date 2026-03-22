import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DuesItem {
  description: string;
  amount: string;
  status: string;
  periodStart: string;
}

interface Props {
  dues: DuesItem[];
}

const statusColors: Record<string, string> = {
  paid: "#22c55e",
  pending: "#eab308",
  overdue: "#ef4444",
  payment_pending: "#3b82f6",
  waived: "#6b7280",
};

export default function DuesChart({ dues }: Props) {
  if (dues.length === 0) return null;

  // Group by month, show last 12 months
  const monthMap = new Map<string, { month: string; amount: number; status: string }>();

  const sorted = [...dues].sort((a, b) => a.periodStart.localeCompare(b.periodStart));
  const last12 = sorted.slice(-12);

  for (const d of last12) {
    const date = new Date(d.periodStart);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", { month: "short" });
    monthMap.set(key, {
      month: label,
      amount: parseFloat(d.amount),
      status: d.status,
    });
  }

  const data = [...monthMap.values()];

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "13px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={statusColors[entry.status] || "#6b7280"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
