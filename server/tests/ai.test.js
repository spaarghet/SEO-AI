jest.mock("../src/services/geminiService");
jest.mock("../src/services/groqService");

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const jwt = require("jsonwebtoken");

const geminiService = require("../src/services/geminiService");
const groqService = require("../src/services/groqService");


beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/seo_ai_test", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await User.deleteMany({});
    geminiService.generateSEO.mockResolvedValue({
        metaTitle: "Title",
        metaDescription: "Desc",
        outline: ["H1", "H2"],
        internalLinks: ["https://example.com/a"],
        model: "gemini-1.5-flash"
    });
    groqService.generateSEO.mockResolvedValue({
        metaTitle: "Title2",
        metaDescription: "Desc2",
        outline: ["H1", "H2"],
        internalLinks: ["https://example.com/b"],
        model: "gpt-4o-mini"
    });
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe("AI generation", () => {
    it("generates via gemini", async () => {
        const user = await User.create({
            email: "u1@example.com",
            passwordHash: "x",
            quota: 5,
            used: 0
        });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "testsecret");
        const res = await request(app)
            .post("/api/ai/generate")
            .set("Authorization", `Bearer ${token}`)
            .send({ provider: "gemini", input: { keyword: "nodejs", topic: "nodejs tutorial" } });
        expect(res.status).toBe(200);
        expect(res.body.output.metaTitle).toBe("Title");
    });

    it("enforces quota", async () => {
        const user = await User.create({
            email: "u2@example.com",
            passwordHash: "x",
            quota: 0, // exhausted
            used: 0
        });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "testsecret");
        const res = await request(app)
            .post("/api/ai/generate")
            .set("Authorization", `Bearer ${token}`)
            .send({ provider: "groq", input: { keyword: "a", topic: "b" } });
        expect(res.status).toBe(402);
    });
});