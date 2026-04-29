const express = require("express");

const app = express();
app.use(express.json());

const AZURE_KEY = process.env.AZURE_KEY;
const AZURE_REGION = "southeastasia";

app.post("/tts", async (req, res) => {
  try {
    const text = req.body.text || "হ্যালো, আমি কীভাবে সাহায্য করতে পারি?";

    const ssml = `
<speak version="1.0" xml:lang="bn-BD">
  <voice name="bn-BD-NabanitaNeural">
    ${text}
  </voice>
</speak>`;

    const response = await fetch(
      `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "raw-16khz-16bit-mono-pcm"
        },
        body: ssml
      }
    );

    const audio = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "application/octet-stream");
    res.send(audio);

  } catch (err) {
    res.status(500).send("Error");
  }
});

app.listen(3000, () => console.log("Server running"));
