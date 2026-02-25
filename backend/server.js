const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '.env') });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//--------------------------------Import Routes--------------------------------
const crackCodeRoutes = require("./routes/admin/crackCode.route");
const publicCrackCodeRoutes = require("./routes/public/crackCode.route");

const deadlockAdminRoutes = require("./routes/admin/admin.route");
const codeRoutes = require("./routes/public/code.route");
const deadlockRoute = require("./routes/public/deadlock.routes");


const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Attach io to app to use in controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log(">>> [SOCKET] User connected:", socket.id);

  socket.on("join-admin", () => {
    socket.join("admin-room");
    console.log(">>> [SOCKET] Admin joined room:", socket.id);
  });

  socket.on("join-team", (teamName) => {
    // Standardize to use team identifiers consistent throughout
    socket.join(`team-${teamName}`);
    console.log(`>>> [SOCKET] Team [${teamName}] joined room:`, socket.id);
  });

  socket.on("report-illegal-action", (data) => {
    console.log(">>> [SECURITY] Illegal action reported:", data);
    io.to("admin-room").emit("new-log", {
      ...data,
      timestamp: new Date(),
      type: "ALERT"
    });
  });

  socket.on("report-tab-switch", (data) => {
    console.log(">>> [SECURITY] Tab switch reported:", data);
    io.to("admin-room").emit("new-log", {
      ...data,
      timestamp: new Date(),
      type: "TAB_SWITCH"
    });
  });

  socket.on("disconnect", () => {
    console.log(">>> [SOCKET] User disconnected:", socket.id);
  });
});


app.use(cors({
  origin: "*",
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Deadlock backend running with Socket.io");
});

// --------------------------------Routes--------------------------------
app.use("/api/public/deadlock", deadlockRoute);
app.use("/api/admin/deadlock", deadlockAdminRoutes);
app.use("/api/admin/crack-code", crackCodeRoutes);
app.use("/api/public/crack-code", publicCrackCodeRoutes);
// app.use("/api/public/deadlock", publicDeadlockRoutes);
app.use("/api/public/code", codeRoutes);
app.use("/api/public/glitch", require("./routes/public/glitch.routes"));

//-------------------------------Dev Route -------------------------------------
if (process.env.NODE_ENV !== "production") {
  app.use("/api/dev", require("./routes/dev/devSeed.routes"));
}

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.get("/health", (req, res) => {
  res.status(200).send("Server is running");
});

mongoose
  .connect(MONGO_URI, { dbName: 'Deadlock' })
  .then(() => {
    console.log("MongoDB connected");
    console.log("Connected to Database:", mongoose.connection.name);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed");
    console.error(err.message);
    process.exit(1);
  });

