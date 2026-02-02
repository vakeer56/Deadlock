// server/index.js
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: { origin: "*" }
});

io.on("connection", socket => {
    console.log("User connected");
});

http.listen(5000, () => console.log("Server running"));
