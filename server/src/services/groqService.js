const OpenAI = require("openai");

// Point the OpenAI SDK to Groq's API endpoint
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

function buildPrompt(input) {
    const { keyword, topic } = input;
    return `You are an SEO assistant. Produce a JSON object for an SEO blog for keyword: "${keyword}" and topic or URL: "${topic}". The JSON must contain:
{
  "metaTitle": "<title up to 70 chars>",
  "metaDescription": "<description up to 160 chars>",
  "outline": ["H1", "H2: subsection", ...],
  "internalLinks": ["https://example.com/page1", "..."]
}
Return only valid JSON without markdown formatting. Be concise and helpful.`;
}

module.exports = {
    generateSEO: async (input) => {
        if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");
        const prompt = buildPrompt(input);
        const resp = await client.chat.completions.create({
            model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });

        let text = resp.choices?.map((c) => c.message?.content).join("\n") || "";

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            parsed = { text };
        }
        return { model: process.env.GROQ_MODEL, raw: resp, ...parsed };
    },

    streamSEO: async (input, onChunk, onDone, onError) => {
        if (!process.env.GROQ_API_KEY) return onError(new Error("GROQ_API_KEY not set"));
        const prompt = buildPrompt(input);

        try {
            // FIX: Use .create() and add stream: true
            const stream = await client.chat.completions.create({
                model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                stream: true
            });

            let buffer = "";
            for await (const part of stream) {
                // The structure for chunks is slightly different when streaming
                const delta = part.choices?.[0]?.delta?.content;
                if (delta) {
                    buffer += delta;
                    onChunk(delta);
                }
            }
            let cleanedText = buffer.replace(/```json/g, "").replace(/```/g, "").trim();
            let parsed;
            try {
                parsed = JSON.parse(cleanedText);
            } catch {
                parsed = { text: buffer };
            }

            // Send the perfectly formatted object back to the controller
            onDone({ model: process.env.GROQ_MODEL, ...parsed });
        } catch (err) {
            onError(err);
        }
    }
};