const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const productRouter = require("./product");
const categoryRouter = require("./category");
const userRouter = require("./user");
const adminRouter = require("./admin");

router.use(authRouter);
router.use(productRouter);
router.use(categoryRouter);
router.use(userRouter);
router.use(adminRouter);

module.exports = router;
