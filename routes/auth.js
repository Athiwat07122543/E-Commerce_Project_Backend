const express = require("express");
const router = express.Router();

const {register,login,checkRole} = require("../controller/Auth")

router.post("/register", register);
router.post("/login", login);
router.post("/checkrole", checkRole);

module.exports = router;