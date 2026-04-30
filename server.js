
const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bangla Azure TTS bridge is running");
});

app.all("/tts", async (req, res) => {
  try {
    const text =
      req.body?.message?.text ||
      req.body?.text ||
      req.query?.text ||
      "হ্যালো";

    const azureKey = process.env.AZURE_KEY;
    const azureRegion = process.env.AZURE_REGION || "southeastasia";

    if (!azureKey) {
      return res.status(500).send("Azure key missing");
    }

   <speak version="1.0" xml:lang="bn-BD">
  <voice name="bn-BD-NabanitaNeural">
    <prosody rate="8%" pitch="+8%">
      ${escapeXml(text)}
    </prosody>
  </voice>
</speak>

    const response = await fetch(
      `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": azureKey,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "raw-24khz-16bit-mono-pcm",
          "User-Agent": "bangla-vapi-tts"
        },
        body: ssml
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure error:", errorText);
      return res.status(500).send("Azure TTS failed");
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "application/octet-stream");
    res.send(audioBuffer);
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).send("TTS failed");
  }
});

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
