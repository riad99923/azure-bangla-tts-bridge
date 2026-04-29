const express = require("express");

const app = express();
app.use(express.json({ limit: "1mb" }));

const AZURE_KEY = process.env.AZURE_KEY;
const AZURE_REGION = process.env.AZURE_REGION || "southeastasia";
const VOICE = "bn-BD-NabanitaNeural";

app.get("/", (req, res) => {
  res.send("Bangla Azure TTS bridge is running");
});

app.post("/tts", async (req, res) => {
  try {
    console.log("Vapi body:", JSON.stringify(req.body));

    const message = req.body.message || {};
    const text =
      message.text ||
      req.body.text ||
      "হ্যালো, আমি কীভাবে সাহায্য করতে পারি?";

    const sampleRate = message.sampleRate || 24000;

    const outputFormat =
      sampleRate === 8000
        ? "raw-8khz-16bit-mono-pcm"
        : sampleRate === 16000
        ? "raw-16khz-16bit-mono-pcm"
        : "raw-24khz-16bit-mono-pcm";

    const ssml = `
<speak version="1.0" xml:lang="bn-BD">
  <voice name="${VOICE}">
    ${escapeXml(text)}
  </voice>
</speak>`;

    const response = await fetch(
      `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": outputFormat,
          "User-Agent": "vapi-azure-bangla-tts"
        },
        body: ssml
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure error:", errorText);
      return res.status(500).send("Azure TTS failed");
    }

    const audio = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", audio.length);
    res.status(200).send(audio);
  } catch (err) {
    console.error("Bridge error:", err);
    res.status(500).send("Bridge error");
  }
});

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
