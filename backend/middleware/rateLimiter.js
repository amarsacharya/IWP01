const rateLimit = require('express-rate-limit');

// Rate limiting for AI endpoints specifically to protect Gemini API limits 
// and prevent high usage or sudden bursts of requests.
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 15, // limit each IP to 15 requests per windowMs
    message: {
        message: 'Too many requests generated from this IP, please try again after an hour. This protects the free tier API quota.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { aiLimiter };
