'use client';

import { useState, useEffect } from 'react';
import StockHistoryChart from './StockHistoryChart';

interface StockCardProps {
    symbol: string;
    price: number | null;
    onPredict: (symbol: string, price: number) => void;
    loading: boolean;
    prediction?: string;
}

export default function StockCard({ symbol, price, onPredict, loading, prediction }: StockCardProps) {
    const [showChart, setShowChart] = useState(false);
    const [history, setHistory] = useState<{ date: string; price: number }[] | null>(null);
    const [chartLoading, setChartLoading] = useState(false);

    const toggleChart = async () => {
        if (!showChart && !history) {
            setChartLoading(true);
            try {
                const res = await fetch(`http://localhost:8000/history?symbol=${symbol}`);
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error('Failed to fetch history:', err);
            }
            setChartLoading(false);
        }
        setShowChart(!showChart);
    };

    return (
        <div className="rounded-xl shadow-md p-6 bg-black text-white w-full max-w-sm mb-6">
            <div className="text-lg font-semibold">{symbol}</div>

            {price !== null ? (
                <div className="text-2xl font-bold mb-4">${price.toFixed(2)}</div>
            ) : (
                <div className="text-red-500 text-sm mb-4">Price unavailable</div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => onPredict(symbol, price!)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    disabled={loading || price === null}
                >
                    {loading ? 'Predicting...' : 'Predict'}
                </button>

                <button
                    onClick={toggleChart}
                    className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                >
                    {showChart ? 'Hide Chart' : 'Show Chart'}
                </button>
            </div>

            {prediction && (
                <div className="mt-3 text-center font-medium text-green-400">
                    {prediction}
                </div>
            )}

            {showChart && (
                <div className="mt-4">
                    {chartLoading ? (
                        <div className="text-sm text-gray-400">Loading chart...</div>
                    ) : (
                        history && <StockHistoryChart data={history} />
                    )}
                </div>
            )}
        </div>
    );
}
