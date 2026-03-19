module.exports = (err, req, res, next) => {
    // Log the actual error internally for debugging
    console.error(`[ERROR] ${err.message}`, err.stack);

    // Standardized JSON response
    const status = err.status || 500;
    const message = err.message || "An unexpected server error occurred.";

    res.status(status).json({
        error: message,
        // Only show stack trace in local development
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};