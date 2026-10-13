import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type DeviceData = {
  name: string;
  value: number;
};

type Prop = {
  deviceData: DeviceData[];
};

const COLORS = ["#4ade80", "#facc15", "#60a5fa"];

export const DeviceStat = ({ deviceData }: Prop) => {
  return (
    <ResponsiveContainer width="100%" height={260} minWidth={0}>
      <PieChart>
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="4"
              floodColor="#000"
              floodOpacity="0.2"
            />
          </filter>
        </defs>

        <Pie
          data={deviceData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          stroke="#0f172a"
          strokeWidth={2}
          isAnimationActive
          filter="url(#shadow)"
        >
          {deviceData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "none",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#fff" }}
          itemStyle={{ color: "#fff" }}
        />

        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          formatter={(value) => (
            <span className="text-white text-sm ml-1">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
