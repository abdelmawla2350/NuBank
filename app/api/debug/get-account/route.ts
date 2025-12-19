import { NextResponse } from "next/server";
import { getAccount } from "@/lib/actions/bank.actions";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const appwriteItemId = url.searchParams.get("appwriteItemId");

    if (!appwriteItemId) {
      return NextResponse.json({ ok: false, error: "appwriteItemId query required" }, { status: 400 });
    }

    const account = await getAccount({ appwriteItemId });

    return NextResponse.json({ ok: true, result: account });
  } catch (error: any) {
    console.error("/api/debug/get-account error:", error);
    return NextResponse.json({ ok: false, error: error?.message || String(error) }, { status: 500 });
  }
}
