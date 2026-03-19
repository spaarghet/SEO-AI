const Generation = require("../models/Generation");
const geminiService = require("../services/geminiService");
const groqService = require("../services/groqService");
const { exportToTxt } = require("../utils/export");

// check quota helper
async function checkQuota(user) {
    if (user.role === "admin" || user.role === "pro") return true;
    return user.used < user.quota;
}

exports.generate = async (req, res, next) => {
    try {
        const { provider, input } = req.body;
        if (!provider || !input) {
            const err = new Error("Provider and input are required.");
            err.status = 400;
            throw err;
        }

        if (!(await checkQuota(req.user))) {
            const err = new Error("Your monthly generation quota has been reached. Please upgrade.");
            err.status = 402;
            throw err;
        }

        let result;
        try {
            if (provider === "gemini") result = await geminiService.generateSEO(input);
            else if (provider === "groq") result = await groqService.generateSEO(input);
        } catch (apiErr) {
            // Handle specific AI Provider failures (Timeout/Quota)
            const err = new Error(`AI Provider Error: ${apiErr.message}`);
            err.status = 502; // Bad Gateway
            throw err;
        }

        const gen = await Generation.create({
            userId: req.user._id,
            provider,
            providerModel: result.model,
            input,
            output: result
        });

        req.user.used += 1;
        await req.user.save();
        res.json({ id: gen._id, output: result });
    } catch (err) {
        next(err); // Pass to errorHandler.js
    }
};
exports.history = async (req, res, next) => {
    try {
        let filter = { userId: req.user._id };

        // If the user is an admin, remove the filter to fetch ALL histories
        if (req.user.role === "admin") {
            filter = {};
        }

        const items = await Generation.find(filter)
            .populate("userId", "email") // Attach the user's email to the result
            .sort({ createdAt: -1 })
            .limit(200);

        res.json({ data: items });
    } catch (err) {
        next(err);
    }
};

exports.exportGeneration = async (req, res, next) => {
    try {
        const gen = await Generation.findById(req.params.id);
        if (!gen) return res.status(404).json({ error: "Not found" });
        if (!gen.userId.equals(req.user._id) && req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

        const txt = exportToTxt(gen);
        res.setHeader("Content-disposition", `attachment; filename=generation-${gen._id}.txt`);
        res.setHeader("Content-type", "text/plain");
        res.send(txt);
    } catch (err) {
        next(err);
    }
};

// SSE stream using Groq service (word-by-word). Accepts query params: ?keyword=...&topic=...
exports.streamGroq = async (req, res, next) => {
    try {
        const user = req.user;
        if (!(await checkQuota(user))) return res.status(402).json({ error: "Quota exceeded" });

        const { keyword, topic } = req.query;
        if (!keyword || !topic) return res.status(400).json({ error: "Missing keyword or topic" });

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const onChunk = (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        };

        const onDone = async (meta) => {
            const result = meta;
            const gen = await Generation.create({
                userId: user._id,
                provider: "groq", // Updated provider
                providerModel: result.model,
                input: { keyword, topic },
                output: result
            });
            user.used += 1;
            await user.save();
            res.write(`data: ${JSON.stringify({ done: true, id: gen._id })}\n\n`);
            res.end();
        };

        const onError = (err) => {
            res.write(`data: ${JSON.stringify({ error: err?.message || "Stream error" })}\n\n`);
            res.end();
        };

        await groqService.streamSEO({ keyword, topic }, onChunk, onDone, onError);
    } catch (err) {
        next(err);
    }
};