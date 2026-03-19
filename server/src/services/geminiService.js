const axios = require("axios");

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

function buildPrompt(input) {
    const { keyword, topic } = input;

    return `
Generate SEO content in JSON format.

Keyword: ${keyword}
Topic: ${topic}

Return JSON with:

metaTitle
metaDescription
outline (array)
internalLinks (array)

Return only JSON.
`;
}

async function callGemini(prompt) {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
        throw new Error("GEMINI_API_KEY missing");
    }

    // 1. ADD .trim() and .replace() to sanitize the .env variable
    const rawModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = rawModel.trim().replace(/['"]/g, "").replace("models/", "");

    const url = `${BASE}/${model}:generateContent?key=${key}`;

    // 2. ADD THIS CONSOLE LOG to see the exact URL in your terminal
    console.log("Calling Gemini API with URL:", url.replace(key, "HIDDEN_KEY"));

    const body = {
        contents: [
            {
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        ],
    };

    const res = await axios.post(url, body);

    const text =
        res.data.candidates[0].content.parts[0].text;

    let parsed;

    try {
        parsed = JSON.parse(text);
    } catch {
        parsed = { text };
    }

    return {
        model,
        ...parsed,
    };
}

module.exports = {
    generateSEO: async (input) => {
        const prompt = buildPrompt(input);
        return await callGemini(prompt);
    },
};