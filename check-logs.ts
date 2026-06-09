import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function checkLogs() {
  const sid = "CAaec3273bd023aefc7f64fe3c6910b004";
  console.log(`Fetching details for Call SID: ${sid}`);
  
  const call = await client.calls(sid).fetch();
  console.log("Call Status:", call.status);
  
  const notifications = await client.calls(sid).notifications.list();
  if (notifications.length === 0) {
    console.log("No Twilio errors/warnings found for this call.");
  } else {
    notifications.forEach(n => {
      console.log(`[${n.messageDate}] ERROR ${n.errorCode}: ${n.messageText}`);
    });
  }
}

checkLogs().catch(console.error);
