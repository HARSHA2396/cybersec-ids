// backend/config.js
module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'super-secure-key',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/cybersec_ids',
};
