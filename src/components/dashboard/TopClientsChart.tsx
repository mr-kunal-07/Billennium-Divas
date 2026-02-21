import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

interface TopClient {
  name: string;
  total: number;
  count: number;
}

interface TopClientsChartProps {
  clients: TopClient[];
  currency: "INR" | "USD";
}

export default function TopClientsChart({ clients, currency }: TopClientsChartProps) {
  const truncateName = (name: string, maxLength = 15) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "...";
  };

  const data = clients.map((client) => ({
    ...client,
    displayName: truncateName(client.name),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Clients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No client data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    currency === "INR"
                      ? `₹${(value / 1000).toFixed(0)}k`
                      : `$${(value / 1000).toFixed(0)}k`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="displayName"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border rounded-lg shadow-lg p-3">
                          <p className="font-medium mb-1">{data.name}</p>
                          <p className="text-sm">
                            Total: {formatCurrency(data.total, currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {data.count} invoice{data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
