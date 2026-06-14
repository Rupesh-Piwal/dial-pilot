import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callSid = searchParams.get("callSid");

    if (!callSid) {
      return NextResponse.json({ success: false, error: "callSid is required" }, { status: 400 });
    }

    const call = await client.calls(callSid).fetch();

    return NextResponse.json({ success: true, status: call.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch status" },
      { status: 500 }
    );
  }
}
