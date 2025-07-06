const express = require("express");
const router = express.Router();
const { checkUser, checkAdmin } = require("../middlewares/AuthCheck");

const {
  addAddress,
  getAddress,
  changeAddress,
  addCart,
  reduceCart,
  getCart,
  clearCart,
} = require("../controller/User");
const {
  checkOut,
  checkOrderById,
  webhookHandler,
} = require("../controller/Stripe");

router.post("/checkout", checkUser, checkOut);

router.post("/address", checkUser, addAddress);
router.get("/address", checkUser, getAddress);
router.post("/changeaddress", checkUser, changeAddress);
router.post("/addCart", checkUser, addCart);
router.post("/reduceCart", checkUser, reduceCart);
router.get("/cart", checkUser, getCart);

router.delete("/cart", checkUser, clearCart);

module.exports = router;
