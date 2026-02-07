const express = require("express");
const router = express.Router();
const { executeCode } = require("../../controller/code.controller");

router.post("/execute", executeCode);

module.exports = router;
