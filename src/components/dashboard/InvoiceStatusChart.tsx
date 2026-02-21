import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InvoiceStatusChartProps {
  statusCounts: Record<string, number>;
}

const COLORS = {
  draft: "#94a3b8",
  sent: "#3b82f6",
  paid: "#10b981",
  overdue: "#ef4444",
  cancelled: "#6b7280",
  pending: "#f59e0b",
  partial: "#8b5cf6",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  pending: "Pending",
  partial: "Partial",
};

export default function InvoiceStatusChart({ statusCounts }: InvoiceStatusChartProps) {
  const data = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: COLORS[status as keyof typeof COLORS] || "#6b7280",
    }));

  if (data.length === 0) {
    data.push({ name: "No Data", value: 1, color: "#e5e7eb" });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Invoice Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg p-2">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.value} invoice{data.value !== 1 ? "s" : ""}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
