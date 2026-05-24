const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose')
const setupSocket = require('./config/socketConfig');
const gameRoutes = require('./routes/gameRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("Database engine synced and secured"))
.catch((err)=>console.error("Database connection error:", err))

app.get("/health", (req, res) => {
  res.status(200).json({ status: "online", system: "Cyberpunk Manor Murder Engine" });
});

app.use('/api/game', gameRoutes);

const server = http.createServer(app);
const io = setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});