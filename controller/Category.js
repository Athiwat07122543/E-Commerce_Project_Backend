const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const checkCategory = await prisma.category.findFirst({
      where: {
        name: name,
      },
    });

    if (checkCategory) {
      return res.json({
        success: false,
        error: "CAN'T_ADD_CATEGORY",
        message: "Category นี้มีในระบบแล้ว",
      });
    }
    const data = await prisma.category.create({
      data: {
        name: name,
      },
    });

    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "CAN'T_ADD_CATEGORY",
      message: "Server error",
    });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const data = await prisma.category.findMany();
    if(!data){
      return;
    }
    res.send(data);
  } catch (err) {
    console.log(err);
    res.json({
      error: "CAN'T_GET_CATEGORY",
      message: "ไม่สามารดูประเภทสินค้าได้",
    });
  }
};

exports.editCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, enabled } = req.body;
    const data = await prisma.category.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name,
        enabled: enabled,
      },
    });
    res.send({ data });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await prisma.category.delete({
      where: {
        id: Number(id),
      },
    });
    res.json({ data });
  } catch (err) {
    console.log(err);
  }
};
