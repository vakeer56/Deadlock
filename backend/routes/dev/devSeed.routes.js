const express = require("express");
const router = express.Router();
const controller = require("../../controller/dev/devSeed.controller");

router.post("/deadlock", controller.seedDeadlock);

module.exports = router;
