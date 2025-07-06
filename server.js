const express = require("express");
const app = express();
const port = 3000;
const router = require("./routes");
const cors = require("cors");
const { webhookHandler } = require("./controller/Stripe");

require("dotenv").config();
app.use(cors());
app.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
app.use("/api", router);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
