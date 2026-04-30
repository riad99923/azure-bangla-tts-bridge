const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ROOT CHECK
app.get("/", (req, res) => {
  res.send("Bangla Azure TTS bridge is running");
});

// 🔥 MAIN TTS ROUTE (supports BOTH GET & POST)
app.all("/tts", async (req, res) => {
  try {
    const text = req.body.text || req.query.text;

    if (!text) {
      return res.status(400).send("Missing text");
    }

    const azureKey = process.env.AZURE_KEY;
    const azureRegion = process.env.AZURE_REGION;

    if (!azureKey || !azureRegion) {
      return res.status(500).send("Azure config missing");
    }

    const voice = "bn-BD-NabanitaNeural";

    const response = await fetch(
      `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": azureKey,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3"
        },
        body: `
          <speak version='1.0' xml:lang='bn-BD'>
            <voice xml:lang='bn-BD' name='${voice}'>
              ${text}
            </voice>
          </speak>
        `
      }
    );

    const audioBuffer = await response.arrayBuffer();

    res.set({
      "Content-Type": "audio/mpeg"
    });

    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error("TTS ERROR:", error);
    res.status(500).send("TTS failed");
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
