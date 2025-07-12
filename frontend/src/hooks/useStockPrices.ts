import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export function useStockPrices() {
    return useQuery({
        queryKey: ['stock-prices'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:8000/stocks');
            return res.data; // [{ symbol: string, price: number }]
        },
        refetchInterval: 10000,
    });
}
