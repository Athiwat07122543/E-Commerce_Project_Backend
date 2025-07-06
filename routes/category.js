const express = require("express");
const router = express.Router();
const { checkUser, checkAdmin } = require("../middlewares/AuthCheck");
const {
  createCategory,
  getCategory,
  editCategory,
  deleteCategory,
} = require("../controller/Category");

router.get("/getcategory", getCategory);
router.post("/createcategory", checkUser, checkAdmin, createCategory);
router.put("/editcategory/:id", checkUser, checkAdmin, editCategory);
router.delete("/deletecategory/:id", checkUser, checkAdmin, deleteCategory);
module.exports = router;
