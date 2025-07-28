import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'TSLA';

    const API_KEY = process.env.TWELVEDATA_API_KEY;
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${API_KEY}`;

    try {
        const res = await fetch(url);
        const json = await res.json();

        if (json.status === 'error') {
            return NextResponse.json({ error: json.message }, { status: 400 });
        }

        const data = json.values.map((item: any) => ({
            date: item.datetime,
            price: parseFloat(item.close)
        }));

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
