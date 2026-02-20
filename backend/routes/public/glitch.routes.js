const express = require("express");
const router = express.Router();
const controller = require("../../controller/public/glitch.controller");

router.post("/activate", controller.activateGlitch);
router.get("/status", controller.getGlitchStatus);

module.exports = router;
