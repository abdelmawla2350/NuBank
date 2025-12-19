import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";

export async function POST(req: Request) {
  try {
    // Only allow this debug route in development to avoid accidental production changes
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
    }
    const body = await req.json();
    const id = body?.id || null;

    if (!id) {
      return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    }

    const {
      APPWRITE_DATABASE_ID: DATABASE_ID,
      APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
    } = process.env;

    if (!DATABASE_ID || !TRANSACTION_COLLECTION_ID) {
      return NextResponse.json({ ok: false, error: "Appwrite env vars missing" }, { status: 500 });
    }

    const { database } = await createAdminClient();

    const updated = await database.updateDocument(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      id,
      {
        status: "processed",
        // set a reconciliation timestamp so UI heuristics consider it settled
        date: new Date().toISOString(),
      }
    );

    return NextResponse.json({ ok: true, result: updated });
  } catch (error: any) {
    console.error("/api/debug/force-mark-transaction error:", error);
    return NextResponse.json({ ok: false, error: error?.message || String(error) }, { status: 500 });
  }
}
