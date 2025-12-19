import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body?.userId;
    const accessToken = body?.accessToken;

    if (!userId && !accessToken) {
      return NextResponse.json({ error: 'Missing userId or accessToken' }, { status: 400 });
    }

    const tokenParams: any = {
      client_name: 'NU Bank',
      products: ['auth', 'transactions'],
      language: 'en',
      country_codes: ['US'],
    };

    if (userId) tokenParams.user = { client_user_id: userId };
    if (accessToken) tokenParams.access_token = accessToken; // enables update mode / re-consent for existing items

    const response = await plaidClient.linkTokenCreate(tokenParams);
    return NextResponse.json({ linkToken: response.data.link_token });
  } catch (err) {
    console.error('Error creating Plaid link token (API):', err);
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 });
  }
}
