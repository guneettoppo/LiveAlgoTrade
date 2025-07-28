// app/page.tsx
'use client';

import StockCard from '@/components/StockCard';
import StockHistoryChart from '@/components/StockHistoryChart';
import { useStockPrices } from '@/hooks/useStockPrices';
import { useState } from 'react';

export default function Home() {
    const { data, isLoading, error } = useStockPrices();
    const [predictions, setPredictions] = useState<Record<string, string>>({});
    const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null);

    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [history, setHistory] = useState<{ date: string; price: number }[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const handlePredict = async (symbol: string, price: number) => {
        setLoadingSymbol(symbol);
        try {
            const res = await fetch(`http://localhost:8000/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symbol, price }),
            });

            const data = await res.json();
            const arrow = data.direction === 'up' ? '↑ Up' : '↓ Down';
            setPredictions((prev) => ({
                ...prev,
                [symbol]: `${arrow} (${data.change}%)`,
            }));
        } catch (err) {
            setPredictions((prev) => ({
                ...prev,
                [symbol]: `Error`,
            }));
        }
        setLoadingSymbol(null);
    };

    const loadHistory = async (symbol: string) => {
        setSelectedSymbol(symbol);
        setHistory([]);
        setHistoryLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/history?symbol=${symbol}`);
            const data = await res.json();
            setHistory(data);
        } catch (e) {
            console.error('Failed to fetch history', e);
        } finally {
            setHistoryLoading(false);
        }
    };

    if (isLoading) return <div className="text-center mt-20 text-gray-500">Loading prices...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">Failed to fetch prices</div>;

    return (
        <main className="min-h-screen bg-black-100 p-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-white">📈 Live Stock Predictor</h1>

            <div className="flex flex-wrap justify-center gap-6">
                {data?.map((stock: any) => (
                    <StockCard
                        key={stock.symbol}
                        symbol={stock.symbol}
                        price={stock.price}
                        prediction={predictions[stock.symbol]}
                        onPredict={(symbol, price) => handlePredict(symbol, price)}
                        loading={loadingSymbol === stock.symbol}
                        onClick={() => loadHistory(stock.symbol)}
                    />
                ))}
            </div>

            {historyLoading && <p className="text-center mt-6 text-white">Loading history...</p>}
            {!historyLoading && history.length > 0 && selectedSymbol && (
                <div className="flex flex-col items-center mt-6">
                    <h3 className="text-white text-lg mb-2 font-medium">
                        Showing history for <span className="font-bold">{selectedSymbol}</span>
                    </h3>
                    <StockHistoryChart data={history} />
                </div>
            )}
        </main>
    );
}
