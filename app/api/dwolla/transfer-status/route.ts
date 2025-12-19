import { NextResponse } from "next/server";
import { getTransfer, getFundingSource } from "@/lib/actions/dwolla.actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transferLocation, transferId, fundingSourceUrl } = body;

    const result: any = {};

    if (transferLocation || transferId) {
      const target = transferLocation || transferId;
      result.transfer = await getTransfer(target);
    }

    if (fundingSourceUrl) {
      result.fundingSource = await getFundingSource(fundingSourceUrl);
    }

    // Log and include a serialized debug string to ensure CLI/PowerShell shows contents
    try {
      const debugString = JSON.stringify(result, null, 2);
      console.log("/api/dwolla/transfer-status result:", debugString);
      return NextResponse.json({ ok: true, data: result, debug: debugString });
    } catch (s) {
      console.log("/api/dwolla/transfer-status result (non-serializable)");
      return NextResponse.json({ ok: true, data: result });
    }
  } catch (err: any) {
    console.error("/api/dwolla/transfer-status error:", err?.status || err);
    return NextResponse.json({ ok: false, error: err?.body || err?.message || String(err) }, { status: 500 });
  }
}
