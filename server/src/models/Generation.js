const mongoose = require("mongoose");

const generationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, required: true },
    providerModel: { type: String },
    input: { type: Object },
    output: { type: Object },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Generation", generationSchema);