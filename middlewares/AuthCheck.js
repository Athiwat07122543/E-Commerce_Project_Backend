const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const key = process.env.JWT;

exports.checkUser = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || authHeader == null || authHeader == "null") {
      return res.json({
        success: false,
        error: "AUTHHEADER_ERROR",
        message: "ไม่สามารถใช้งานได้",
      });
    }
    const token = authHeader && authHeader.split(" ")[1];

    if (!token || token === "null") {
      return res.json({
        success: false,
        error: "NO_TOKEN",
        message: "ไม่สามารถใช้งานได้",
      });
    }
    const decoded = jwt.verify(token, key);
    req.user = decoded;

    const user = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
    });

    if (!user) {
      return res.json({
        success: false,
        error: "USERNAME_INCORRECT",
        message: "บัญชีนี้มีข้อมูลผิดพลาด",
      });
    }

    if (!user.enabled || user.enabled === false) {
      return res.json({
        success: false,
        error: "USERNAME_IS_DISABLRED",
        message: "บัญชีนี้มีข้อมูลผิดพลาด",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    res.send(500).json({ message: "Auth has Error" });
  }
};

exports.checkAdmin = async (req, res, next) => {
  try {
    const checkRole = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
      select: {
        role: true,
      },
    });

    if (checkRole.role === "user") {
      return res.json({
        success: false,
        error: "USERNAME_IS_NOT_ADMIN",
        message: "บัญชีนี้มีข้อมูลผิดพลาด",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    res.send(500).json({ message: "Auth has Error" });
  }
};
