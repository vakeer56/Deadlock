require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//--------------------------------Import Routes--------------------------------
const crackCodeRoutes = require("./routes/admin/crackCode.route");
const deadlockAdminRoutes = require("./routes/admin/admin.route");


const app = express();

app.use(cors({
  origin: "*",
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Deadlock backend running");
});

// --------------------------------Routes--------------------------------
app.use("/api/admin/deadlock", deadlockAdminRoutes);
app.use("/api/admin/crack-code", crackCodeRoutes);
const codeRoutes = require("./routes/public/code.route");
app.use("/api/public/code", codeRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed");
    console.error(err.message);
    process.exit(1);
  });
