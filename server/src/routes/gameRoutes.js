const express = require('express')
const router = express.Router();
const gameController = require("../controllers/gameController")

router.post("/create", gameController.createRoom)
module.exports= router