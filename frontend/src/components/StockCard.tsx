'use client';

interface StockCardProps {
    symbol: string;
    price: number | null;
    onPredict: (symbol: string, price: number) => void;
    loading: boolean;
    prediction?: string;
}

export default function StockCard({ symbol, price, onPredict, loading, prediction }: StockCardProps) {
    return (
        <div className="rounded-xl shadow-md p-6 bg-black text-white w-full max-w-sm">
            <div className="text-lg font-semibold">{symbol}</div>

            {price !== null ? (
                <div className="text-2xl font-bold mb-4">${price.toFixed(2)}</div>
            ) : (
                <div className="text-red-500 text-sm mb-4">Price unavailable</div>
            )}

            <button
                onClick={() => onPredict(symbol, price!)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                disabled={loading || price === null}
            >
                {loading ? 'Predicting...' : 'Predict'}
            </button>

            {prediction && (
                <div className="mt-3 text-center font-medium text-green-400">
                    {prediction}
                </div>
            )}
        </div>
    );
}
