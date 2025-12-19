import { NextResponse } from "next/server";
import { getTransfer } from "@/lib/actions/dwolla.actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transferId, transferLocation } = body;

    if (!transferId && !transferLocation) {
      return NextResponse.json({ ok: false, error: 'transferId or transferLocation required' }, { status: 400 });
    }

    const target = transferLocation || transferId;
    const transfer = await getTransfer(target);

    const status = transfer?.body?.status ?? transfer?.status ?? null;

    // If processed, trigger reconcile endpoint internally
    if (String(status).toLowerCase() === 'processed') {
      try {
        // Call internal reconcile route to create Appwrite transactions
        const reconcileRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dwolla/reconcile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transferId: target }),
        });

        const reconcileJson = await reconcileRes.json();
        return NextResponse.json({ ok: true, status, reconciled: reconcileJson.ok, reconcile: reconcileJson });
      } catch (e) {
        return NextResponse.json({ ok: true, status, reconciled: false, error: String(e) });
      }
    }

    return NextResponse.json({ ok: true, status, reconciled: false });
  } catch (err: any) {
    console.error('/api/dwolla/poll error:', err);
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
