const express = require("express");
const router = express.Router();
const { checkUser, checkAdmin } = require("../middlewares/AuthCheck");
const {
  listUser,
  editUser,
  updateStock,
  getOrder,
  updateOrder,
  getOrderBy,
  ordersToDay,
  totalSalesToDay,
  ordersMonthlySales,
} = require("../controller/Admin");


router.post("/updatestock", checkUser, updateStock);
router.get("/orderBy", checkUser, getOrderBy);
router.get("/listuser", checkUser, checkAdmin, listUser);
router.put("/edituser/:id", checkUser, checkAdmin, editUser);
router.get("/orders", checkUser, checkAdmin, getOrder);
router.put("/order", checkUser, checkAdmin, updateOrder);

// Dashboard
router.get("/order", checkUser, checkAdmin, ordersToDay);
router.get("/totalsalestoday", checkUser, checkAdmin, totalSalesToDay);
router.get("/ordersmonthly", checkUser, checkAdmin, ordersMonthlySales);
module.exports = router;
