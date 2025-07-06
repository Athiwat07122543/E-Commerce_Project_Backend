const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs/promises");
const path = require("path");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, quantity, sold, price, categoryId } = req.body;
    const image = req.files;

    const checkName = await prisma.product.findFirst({
      where: {
        name: name,
      },
    });

    if (checkName) {
      image.forEach((item) => {
        const filePath = path.join(__dirname, "../uploads", item.filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", filePath);
        });
      });

      return res.json({ message: "มีสินค้านี้ในระบบแล้ว" });
    }

    const product = await prisma.product.create({
      data: {
        name: name,
        description: description,
        quantity: Number(quantity),
        sold: Number(sold),
        price: Number(price),
        categoryId: Number(categoryId),
      },
    });

    const productId = await prisma.product.findFirst({
      where: {
        name: name,
      },
    });

    const result = await Promise.all(
      image.map((item) =>
        prisma.productImage.create({
          data: {
            productId: Number(productId.id),
            imageUrl: item.filename,
          },
        })
      )
    );

    res.json("Hi");
  } catch (err) {
    console.log(err);
  }
};

exports.listProduct = async (req, res) => {
  try {
    const data = await prisma.product.findMany({
      include: {
        images: true,
      },
    });
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error" });
  }
};

exports.listProductBy = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        images: true,
      },
    });
    console.log(product);
    res.send("work");
  } catch (err) {
    console.log;
    res.status(500).json({ message: "Error" });
  }
};

const handleName = async (req, res, name) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: name,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error" });
  }
};

const handlePrice = async (req, res, price) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: price[0],
          lte: price[1],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error " });
  }
};

const handleCategory = async (req, res, categoryId) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((id) => Number(id)),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error " });
  }
};

exports.filters = async (req, res) => {
  try {
    const { name, categoryId, price } = req.body;

    if (name) {
      await handleName(req, res, name);
    }
    if (categoryId) {
      await handleCategory(req, res, categoryId);
    }
    if (price) {
      await handlePrice(req, res, price);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error " });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, quantity, sold, price, categoryId } = req.body;
    const image = req.files;
    console.log("image", image);

    const data = await prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name,
        description: description,
        quantity: Number(quantity),
        sold: Number(sold),
        price: Number(price),
        categoryId: Number(categoryId),
      },
    });

    const uploadImage = await Promise.all(
      image.map((item) =>
        prisma.productImage.create({
          data: {
            productId: Number(id),
            imageUrl: item.filename,
          },
        })
      )
    );

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error " });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(data);
  } catch (err) {
    console.log(err);
  }
};

exports.deleteProductImage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nameImage } = req.body;
    const result = await prisma.productImage.deleteMany({
      where: {
        productId: id,
      },
    });

    await Promise.all(nameImage.map((item) => fs.unlink("./uploads/" + item)));

    res.send(result);
  } catch (err) {
    console.log(err);
  }
};

exports.deleteProductImageBy = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nameImage } = req.body;
    const result = await prisma.productImage.deleteMany({
      where: {
        productId: id,
        imageUrl: nameImage,
      },
    });

    await fs.unlink("./uploads/" + nameImage);

    res.send(nameImage);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error " });
  }
};
