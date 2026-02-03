require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const deadlockAdminRoutes = require("./routes/admin/admin.route");

const app = express();

/* ---------- Middleware ---------- */
app.use(express.json());

/* ---------- Health Check ---------- */
app.get("/", (req, res) => {
    res.send("Deadlock backend running");
});

/* ---------- Routes ---------- */
app.use("/api/admin/deadlock", deadlockAdminRoutes);

/* ---------- Mongo + Server ---------- */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed");
    console.error(err.message);
    process.exit(1);
  });
