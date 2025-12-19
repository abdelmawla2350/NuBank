import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';
import { plaidClient } from '@/lib/plaid';
import { addFundingSource, createDwollaCustomer } from '@/lib/actions/dwolla.actions';
import { getUserInfo } from '@/lib/actions/user.actions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bankId = body?.bankId;
    if (!bankId) return NextResponse.json({ error: 'Missing bankId' }, { status: 400 });

    const { database } = await createAdminClient();
    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_BANK_COLLECTION_ID = process.env.APPWRITE_BANK_COLLECTION_ID!;

    const bank = await database.getDocument(APPWRITE_DATABASE_ID, APPWRITE_BANK_COLLECTION_ID, bankId);

    if (!bank) return NextResponse.json({ error: 'Bank not found' }, { status: 404 });

    // If fundingSourceUrl already exists, return it
    if (bank.fundingSourceUrl) {
      return NextResponse.json({ fundingSourceUrl: bank.fundingSourceUrl });
    }

    // Must have accessToken and accountId
    const accessToken = bank.accessToken;
    const accountId = bank.accountId || bank.account_id;

    if (!accessToken || !accountId) {
      return NextResponse.json({ error: 'Bank missing access token or account id' }, { status: 400 });
    }

    // Ensure dwolla customer exists
    let user = await getUserInfo({ userId: bank.userId });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let dwollaCustomerId = user.dwollaCustomerid || user.dwollaCustomerId;

    if (!dwollaCustomerId) {
      try {
        const dwollaUrl = await createDwollaCustomer({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          address1: user.address1 || '',
          city: user.city || '',
          state: user.state || '',
          postalCode: user.postalCode || '',
        });

        if (dwollaUrl) {
          dwollaCustomerId = dwollaUrl.split('/').pop();
        }
      } catch (err) {
        console.error('Failed to create Dwolla customer for user', bank.userId, err);
      }
    }

    if (!dwollaCustomerId) {
      return NextResponse.json({ error: 'Dwolla customer id missing and could not be created' }, { status: 400 });
    }

    // Create Plaid processor token for Dwolla
    let processorToken: string | null = null;
    try {
      const procReq = {
        access_token: accessToken,
        account_id: accountId,
        processor: 'dwolla',
      } as any;

      const procResp = await plaidClient.processorTokenCreate(procReq);
      processorToken = procResp.data.processor_token;
    } catch (err: any) {
      console.error('Plaid processorTokenCreate failed:', err?.response?.data || err?.message || err);
      return NextResponse.json({ error: 'Plaid processor token creation failed', details: err?.response?.data || err?.message || err }, { status: 502 });
    }

    // Call Dwolla to add funding source
    let fundingSourceUrl: string | null = null;
    try {
      fundingSourceUrl = await addFundingSource({
        dwollaCustomerId,
        processorToken: processorToken as string,
        bankName: bank.name || 'Plaid Bank',
      });
    } catch (err: any) {
      console.error('Dwolla addFundingSource failed:', err?.body || err?.message || err);
      return NextResponse.json({ error: 'Dwolla funding source creation failed', details: err?.body || err?.message || err }, { status: 502 });
    }

    // Update bank document
    const updated = await database.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      bankId,
      { fundingSourceUrl: fundingSourceUrl || '' }
    );

    return NextResponse.json({ fundingSourceUrl: fundingSourceUrl || null, bank: updated });
  } catch (err: any) {
    console.error('Error adding funding source for bank:', err?.body || err?.message || err);
    const details = err?.body || err?.response?.data || err?.message || String(err);
    return NextResponse.json({ error: 'Failed to add funding source', details }, { status: 500 });
  }
}
