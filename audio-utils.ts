const muLawToPcmMap = new Int16Array(256);
const pcmToMuLawMap = new Uint8Array(65536);

function initTables() {
  for (let i = 0; i < 256; i++) {
    let mu = ~i;
    let sign = (mu & 0x80) ? -1 : 1;
    let exponent = (mu & 0x70) >> 4;
    let mantissa = mu & 0x0f;
    let pcm = sign * (((mantissa << 3) + 132) << exponent) - 132;
    muLawToPcmMap[i] = pcm;
  }
  
  for (let i = -32768; i <= 32767; i++) {
    let pcm = i;
    let sign = (pcm < 0) ? 0x80 : 0x00;
    if (pcm < 0) pcm = -pcm;
    if (pcm > 32635) pcm = 32635;
    pcm += 132;
    
    let exponent = 7;
    for (let expMask = 0x4000; (pcm & expMask) === 0 && exponent > 0; exponent--, expMask >>= 1) {}
    
    let mantissa = (pcm >> (exponent + 3)) & 0x0f;
    let mu = ~(sign | (exponent << 4) | mantissa);
    pcmToMuLawMap[(i + 65536) % 65536] = mu & 0xFF;
  }
}

initTables();


 // Decodes Twilio's base64 mu-law 8kHz payload to PCM16 16kHz base64 payload for Gemini.
 
export function twilioToGemini(base64Mulaw: string): string {
  const mulawBuffer = Buffer.from(base64Mulaw, "base64");
  const pcmBuffer = Buffer.alloc(mulawBuffer.length * 4); 
  
  for (let i = 0; i < mulawBuffer.length; i++) {
    const pcm = muLawToPcmMap[mulawBuffer[i]];
    // Upsample 8kHz to 16kHz by duplicating the sample
    pcmBuffer.writeInt16LE(pcm, i * 4);
    pcmBuffer.writeInt16LE(pcm, i * 4 + 2);
  }
  
  return pcmBuffer.toString("base64");
}

//  Decodes Gemini's base64 PCM16 24kHz payload to mu-law 8kHz base64 payload for Twilio.

export function geminiToTwilio(base64Pcm: string): string {
  const pcmBuffer = Buffer.from(base64Pcm, "base64");
  const numSamples = pcmBuffer.length / 2;
  // Downsample 24kHz to 8kHz by taking every 3rd sample
  const numOutSamples = Math.floor(numSamples / 3);
  const mulawBuffer = Buffer.alloc(numOutSamples);
  
  for (let i = 0; i < numOutSamples; i++) {
    const pcm = pcmBuffer.readInt16LE((i * 3) * 2);
    const pcmIndex = (pcm + 65536) % 65536;
    mulawBuffer[i] = pcmToMuLawMap[pcmIndex];
  }
  
  return mulawBuffer.toString("base64");
}
