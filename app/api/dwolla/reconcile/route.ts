import { NextResponse } from "next/server";
import { getTransfer, getFundingSource } from "@/lib/actions/dwolla.actions";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { createAdminClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transferId, transferLocation } = body;

    if (!transferId && !transferLocation) {
      return NextResponse.json({ ok: false, error: 'transferId or transferLocation required' }, { status: 400 });
    }

    const target = transferLocation || transferId;
    const transfer = await getTransfer(target);

    if (!transfer || !transfer.body) {
      return NextResponse.json({ ok: false, error: 'Could not fetch transfer body from Dwolla' }, { status: 500 });
    }

    const transferBody: any = transfer.body;
    const sourceHref: string = transferBody._links?.source?.href || transferBody._links?.['source-funding-source']?.href;
    const amountValue: string = transferBody.amount?.value;

    if (!sourceHref) {
      return NextResponse.json({ ok: false, error: 'Transfer source href not found' }, { status: 500 });
    }

    // Try to find matching bank by fundingSourceUrl in Appwrite
    const { database } = await createAdminClient();
    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_BANK_COLLECTION_ID = process.env.APPWRITE_BANK_COLLECTION_ID!;

    // First try exact match on fundingSourceUrl
    let bankMatch = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      [Query.equal('fundingSourceUrl', [sourceHref])]
    );

    let bankDoc: any = null;
    if (bankMatch.total === 1) {
      bankDoc = bankMatch.documents[0];
    } else {
      // Try matching by the funding-source id (last path segment)
      try {
        const url = new URL(sourceHref);
        const parts = url.pathname.split('/');
        const possibleId = parts[parts.length - 1];
        const byId = await database.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_BANK_COLLECTION_ID,
          [Query.equal('fundingSourceUrl', [possibleId])]
        );
        if (byId.total === 1) bankDoc = byId.documents[0];
      } catch (e) {
        // ignore
      }
    }

    // Ensure we found a matching bank and it has a userId required by Appwrite schema
    if (!bankDoc) {
      return NextResponse.json({ ok: false, error: 'No matching bank document found for transfer source fundingSourceUrl' }, { status: 404 });
    }

    const bankUserId = bankDoc.userId || bankDoc.userId?.$id || null;
    if (!bankUserId) {
      return NextResponse.json({ ok: false, error: 'Matching bank document is missing userId required by Appwrite transaction schema' }, { status: 400 });
    }

    // Prepare transaction payload
    const cents = Math.round(Number(amountValue) * 100);
    const transactionPayload: any = {
      name: `Dwolla transfer ${transferBody.id}`,
      amount: cents,
      senderBankId: bankDoc.$id,
      receiverBankId: null,
      userId: bankUserId,
      status: transferBody.status,
      date: transferBody.created,
    };

    const created = await createTransaction(transactionPayload as any);

    // Also attempt to create a receiver-side credit transaction if we can map the destination
    let receiverCreated = null;
    try {
      const destHref: string = transferBody._links?.destination?.href;
      if (destHref) {
        // Try to find a matching bank document by fundingSourceUrl === destHref
        const destMatch = await database.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_BANK_COLLECTION_ID,
          [Query.equal('fundingSourceUrl', [destHref])]
        );

        let receiverBankDoc: any = null;
        if (destMatch.total === 1) {
          receiverBankDoc = destMatch.documents[0];
        } else {
          // Try last path segment match
          try {
            const url = new URL(destHref);
            const parts = url.pathname.split('/');
            const possibleId = parts[parts.length - 1];
            const byId = await database.listDocuments(
              APPWRITE_DATABASE_ID,
              APPWRITE_BANK_COLLECTION_ID,
              [Query.equal('fundingSourceUrl', [possibleId])]
            );
            if (byId.total === 1) receiverBankDoc = byId.documents[0];
          } catch (e) {}
        }

        if (receiverBankDoc) {
          const receiverUserId = receiverBankDoc.userId || receiverBankDoc.userId?.$id || null;
          if (receiverUserId) {
            const receiverPayload: any = {
              name: `Dwolla transfer ${transferBody.id}`,
              amount: cents, // cents integer
              senderBankId: bankDoc.$id,
              receiverBankId: receiverBankDoc.$id,
              userId: receiverUserId,
                status: transferBody.status,
              date: transferBody.created,
            };

            receiverCreated = await createTransaction(receiverPayload as any);
          }
        }
      }
    } catch (e) {
      console.warn('Could not create receiver transaction:', e);
    }

    return NextResponse.json({ ok: true, transfer: transferBody, reconciled: !!created, transaction: created, receiverTransaction: receiverCreated });
  } catch (err: any) {
    console.error("/api/dwolla/reconcile error:", err?.status || err);
    return NextResponse.json({ ok: false, error: err?.body || err?.message || String(err) }, { status: 500 });
  }
}
