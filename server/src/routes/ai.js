const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const aiController = require("../controllers/aiController");

// generate (non-streaming)
router.post("/generate", auth, aiController.generate);

// stream (SSE) for Groq
router.get("/stream", auth, aiController.streamGroq);
// history
router.get("/history", auth, aiController.history);

// export .txt
router.get("/export/:id", auth, aiController.exportGeneration);

module.exports = router;