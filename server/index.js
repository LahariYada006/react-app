import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/health", (req, res) => {
  res.json({ success: true });
});

const port = process.env.PORT || 3001;

app.listen(port, "0.0.0.0", () => {
  console.log("Running on", port);
});

