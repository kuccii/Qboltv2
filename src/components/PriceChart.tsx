import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PriceChartProps {
  data: Array<{
    date: string;
    [key: string]: any;
  }>;
  dataKeys: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  height?: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, dataKeys, height = 300 }) => {
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis 
            tickFormatter={formatCurrency} 
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number) => [`${formatCurrency(value)}`, '']}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend formatter={(value) => <span className="text-sm font-medium">{value}</span>} />
          {dataKeys.map((dataKey) => (
            <Line
              key={dataKey.key}
              type="monotone"
              dataKey={dataKey.key}
              name={dataKey.name}
              stroke={dataKey.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;