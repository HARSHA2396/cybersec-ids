const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const apiRoutes = require('./routes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(helmet());
app.use(express.json());

// Attach Socket.io to app
app.set('io', io);

// ✅ ADD IDS LOGGER MIDDLEWARE HERE (monitors all requests to this app)
const idsLogger = require('./middleware/idsLogger');
app.use(idsLogger);

// Attach Socket.io to app
app.set('io', io);

// API routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
