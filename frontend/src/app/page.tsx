'use client';

import StockCard from '@/components/StockCard';
import { useStockPrices } from '@/hooks/useStockPrices';
import { useState } from 'react';

export default function Home() {
    const { data, isLoading, error } = useStockPrices();
    const [predictions, setPredictions] = useState<Record<string, string>>({});
    const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null);

    const handlePredict = async (symbol: string) => {
        setLoadingSymbol(symbol);
        try {
            const res = await fetch(`http://localhost:8000/predict?symbol=${symbol}`);
            const data = await res.json();
            const arrow = data.direction === 'up' ? '🔼 Up' : '🔽 Down';
            setPredictions((prev) => ({
                ...prev,
                [symbol]: `${arrow} (${data.change}%)`,
            }));
        } catch (err) {
            setPredictions((prev) => ({
                ...prev,
                [symbol]: `❌ Error`,
            }));
        }
        setLoadingSymbol(null);
    };


    if (isLoading) return <div className="text-center mt-20 text-gray-500">Loading prices...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">Failed to fetch prices</div>;

    return (
        <main className="min-h-screen bg-black-100 p-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-white-800">📈 Live Stock Predictor</h1>
            <div className="flex flex-wrap justify-center gap-6">
                {data?.map((stock: any) => (
                    <StockCard
                        key={stock.symbol}
                        symbol={stock.symbol}
                        price={stock.price}
                        prediction={predictions[stock.symbol]}
                        onPredict={handlePredict}
                        loading={loadingSymbol === stock.symbol}
                    />
                ))}
            </div>
        </main>
    );
}
