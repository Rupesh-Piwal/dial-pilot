import { NextResponse } from "next/server";
import twilio from "twilio";

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, prompt } = body;

    console.log(`Initiating call to ${phoneNumber} from ${twilioNumber}...`);

    // STEP 3: Trigger actual Twilio call
    const call = await client.calls.create({
      // We will replace this twiml with our WebSocket later!
      twiml: `<Response><Say>Hello! Your Dial Pilot AI agent is connecting. Have a great day!</Say></Response>`,
      to: phoneNumber,
      from: twilioNumber as string,
    });

    console.log("Call created successfully! SID:", call.sid);

    return NextResponse.json({ 
      success: true, 
      message: "Phone should be ringing now!",
      callSid: call.sid
    });

  } catch (error: any) {
    console.error("Failed to create call:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
