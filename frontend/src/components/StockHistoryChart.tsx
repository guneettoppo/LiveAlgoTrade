'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
    data: { date: string; price: number }[];
}

export default function StockHistoryChart({ data }: Props) {

    const cleanData = data.filter((d) => d.price !== null && !isNaN(d.price));

    if (cleanData.length === 0) {
        return (
            <div className="mt-4 p-4 bg-white rounded shadow max-w-2xl w-full text-center text-gray-500">
                No price history available for this stock.
            </div>
        );
    }
    return (
        <div className="bg-white p-4 rounded-lg shadow w-full max-w-2xl text-black">
            <h2 className="text-lg font-semibold mb-2">30-Day Price History</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[...data].reverse()}>
                    <XAxis dataKey="date" hide />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
