import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

interface MonthlyData {
  month: string;
  invoices: number;
  amount: number;
  paid: number;
}

interface RevenueChartProps {
  data: MonthlyData[];
  currency: "INR" | "USD";
}

export default function RevenueChart({ data, currency }: RevenueChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    monthLabel: new Date(item.month + "-01").toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
    pending: item.amount - item.paid,
  }));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  currency === "INR"
                    ? `₹${(value / 1000).toFixed(0)}k`
                    : `$${(value / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg p-3">
                        <p className="font-medium mb-2">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm flex justify-between gap-4">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-medium">
                              {formatCurrency(entry.value as number, currency)}
                            </span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="amount"
                name="Total"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorAmount)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="paid"
                name="Paid"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorPaid)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
