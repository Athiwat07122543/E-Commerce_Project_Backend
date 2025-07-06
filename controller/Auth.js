const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const key = process.env.JWT;

exports.register = async (req, res) => {
  try {
    const { username, password, confirmPassword, email } = await req.body;

    if (!username || username == "") {
      return res.statu(400).json({
        success: false,
        error: "NO_USERNAME_INPUT",
        message: "กรุณาใส่ Username",
      });
    }

    if (!password || password == "") {
      return res.status(400).json({
        success: false,
        error: "NO_PASSWORD_INPUT",
        message: "กรุณาใส่ Password",
      });
    }
    if (!confirmPassword || confirmPassword == "") {
      return res.status(400).json({
        success: false,
        error: "NO_CONFIRMPASSWORD_INPUT",
        message: "กรุณาใส่ Confirm Password",
      });
    }
    if (!email || email == "") {
      return res.status(400).json({
        success: false,
        error: "NO_EMAIL_INPUT",
        message: "กรุณาใส่ Email",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "PASSWORD_NOT_MATCH",
        message: "รหัสผ่านไม่ตรงกัน",
      });
    }
    const getUsername = await prisma.user.findFirst({
      where: {
        username: username,
      },
      select: {
        username: true,
      },
    });

    if (getUsername) {
      return res.status(400).json({
        success: false,
        error: "USERNAME_IS_ALREADY_EXISTS",
        message: "Username นี้ถูกใช้งานแล้ว",
      });
    }

    const checkEmail = await prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        email: true,
      },
    });

    if (checkEmail) {
      return res.status(400).json({
        success: false,
        error: "Email_IS_ALREADY_EXISTS",
        message: "Email นี้ถูกใช้งานแล้ว",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username: username,
        password: hashPassword,
        email: email,
        role: "user",
        enabled: true,
        image: "",
      },
    });

    res.status(200).json({ message: "สมัครบัญชีเรียบร้อย" });
  } catch (err) {
    console.log(err);
    res.send(500).json({ message: "Register ERROR" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || username.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "NO_USERNAME_INPUT",
        message: "กรุณาใส่ Username",
      });
    }

    if (!password || password.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "NO_PASSWORD_INPUT",
        message: "กรุณาใส่ Password",
      });
    }

    const user = await prisma.user.findFirst({
      where: { username },
      select: { username: true, password: true, role: true, enabled: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "NO_USERNAME",
        message: "ไม่พบบัญชีผู้ใช้",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: "PASSWORD_NOT_MATCH",
        message: "รหัสผ่านไม่ถูกต้อง",
      });
    }

    if (!user.enabled) {
      return res.status(403).json({
        success: false,
        error: "ENABLED_FALSE",
        message: "บัญชีนี้ถูกปิดใช้งาน",
      });
    }

    const token = jwt.sign(
      { username: user.username, enabled: user.enabled, role: user.role },
      key,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        username: user.username,
        role: user.role,
        token: token,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Login ERROR" });
  }
};

exports.checkRole = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.json({ error: "NO_TOKEN", message: "ไม่พบ Token" });
    }
    const authToken = authHeader.replace("Bearer ", "");
    const payload = jwt.decode(authToken);
    res.status(200).json({ payload });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "ERROR",
    });
  }
};
