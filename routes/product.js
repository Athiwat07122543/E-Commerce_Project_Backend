const express = require("express");
const router = express.Router();
const { checkUser, checkAdmin } = require("../middlewares/AuthCheck");
const { upload } = require("../middlewares/upload");
const {
  createProduct,
  listProduct,
  listProductBy,
  editProduct,
  deleteProduct,
  filters,
  deleteProductImage,
  deleteProductImageBy,
} = require("../controller/Product");

router.post("/listproduct", listProduct);
router.post("/listproduct/:id", listProductBy);
router.post("/filters", filters);
router.put("/editproduct/:id", checkUser, checkAdmin, upload, editProduct);
router.delete("/deleteproduct/:id", checkUser, checkAdmin, deleteProduct);
router.post("/createproduct", checkUser, checkAdmin, upload, createProduct);
router.delete(
  "/deleteproductimage/:id",
  checkUser,
  checkAdmin,
  deleteProductImage
);
router.post(
  "/deleteproductimageby/:id",
  checkUser,
  checkAdmin,
  deleteProductImageBy
);

module.exports = router;
