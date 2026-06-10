import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { callSid } = body;

    if (!callSid) {
      return NextResponse.json({ success: false, error: "callSid is required" }, { status: 400 });
    }

    console.log(`Hanging up call: ${callSid}`);
    const call = await client.calls(callSid).update({ status: "completed" });

    return NextResponse.json({ success: true, status: call.status });
  } catch (error: any) {
    console.error("Failed to hang up call:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to hang up" },
      { status: 500 }
    );
  }
}
