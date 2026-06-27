const { GoogleGenAI } = require("@google/genai");
const { TTS_MODEL } = require("../constants");
const saveWaveFile = require("../Utility/pcmToWav");
const pcmToWav = require("../Utility/pcmToWav");

async function generateAudio(inputText) {
  const ai = new GoogleGenAI({});

  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text: inputText }] }],
    config: {
      responseModalities: ["AUDIO"],
      responseFormat: {
        audio: {
          mimeType: "audio/wav",
          delivery: "INLINE",
          sampleRate: 16000,
          bitRate: 256000,
        },
      },
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Kore" },
        },
      },
    },
  });

  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  console.log(
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType,
  );
  const audioBuffer = Buffer.from(data, "base64");
  const wav = pcmToWav(audioBuffer);
  return wav;
}

module.exports = generateAudio;
