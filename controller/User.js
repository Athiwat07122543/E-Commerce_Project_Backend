const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.addAddress = async (req, res) => {
  try {
    const { recipientName, addressDetail, phone } = req.body;

    const userId = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
      select: {
        id: true,
      },
    });

    const checkAddress = await prisma.address.findFirst({
      where: {
        userId: Number(userId.id),
      },
    });

    if (checkAddress) {
      const address = await prisma.address.create({
        data: {
          userId: Number(userId.id),
          recipientName,
          addressDetail,
          phone,
          isDefault: false,
        },
      });
      res.json(address);
      return;
    } else {
      const address = await prisma.address.create({
        data: {
          userId: Number(userId.id),
          recipientName,
          addressDetail,
          phone,
          isDefault: true,
        },
      });
      res.json(address);
      return;
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getAddress = async (req, res) => {
  try {
    const userId = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
      select: {
        id: true,
      },
    });

    const address = await prisma.address.findMany({
      where: {
        userId: Number(userId.id),
      },
    });
    res.send(address);
  } catch (err) {
    console.log(err);
  }
};

exports.changeAddress = async (req, res) => {
  try {
    const { addressId } = req.body;
    const userId = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
      select: {
        id: true,
      },
    });

    const defaultId = await prisma.address.findFirst({
      where: {
        userId: Number(userId.id),
        isDefault: true,
      },
      select: {
        id: true,
      },
    });

    const changeDefault = await prisma.address.update({
      where: {
        id: Number(defaultId.id),
      },
      data: {
        isDefault: false,
      },
    });

    const changeAddress = await prisma.address.update({
      where: {
        userId: Number(userId.id),
        id: Number(addressId),
      },
      data: {
        isDefault: true,
      },
    });

    res.send("work");
  } catch (err) {
    console.log(err);
  }
};

exports.addCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
      select: {
        id: true,
      },
    });

    const cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
      },
    });

    // สร้าง cart ถ้ายังไม่มี
    let cartId = cart?.id;
    if (!cartId) {
      const newCart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
      cartId = newCart.id;
    }

    const product = await prisma.product.findFirst({
      where: {
        id: Number(productId),
      },
    });

    const detail = await prisma.detailCart.findFirst({
      where: {
        cartId: cartId,
        productId: product.id,
      },
    });

    if (!detail) {
      await prisma.detailCart.create({
        data: {
          product: {
            connect: { id: product.id },
          },
          price: product.price,
          quantity: 1,
          cart: {
            connect: { id: cartId },
          },
        },
      });
    } else {
      await prisma.detailCart.updateMany({
        where: {
          cartId: cartId,
          productId: product.id,
        },
        data: {
          quantity: {
            increment: 1,
          },
        },
      });
    }
    res.send("work");
  } catch (err) {
    console.log("Error adding to cart:", err);
    res.status(500).send("server error");
  }
};

exports.reduceCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const quantityProduct = await prisma.detailCart.findFirst({
      where: {
        productId: productId.id,
      },
    });

    if (!quantityProduct) {
      return res.send("ERROR");
    }

    if (quantityProduct.quantity > 1) {
      await prisma.detailCart.updateMany({
        where: {
          productId: Number(productId),
        },
        data: {
          quantity: {
            increment: -1,
          },
        },
      });
      return res.json({ message: "-1" });
    } else {
      await prisma.detailCart.deleteMany({
        where: {
          productId: Number(productId),
        },
      });
      return res.json({ message: "0" });
    }
    res.send("work");
  } catch (err) {
    console.log(err);
  }
};

exports.getCart = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
      select: {
        id: true,
      },
    });

    const cart = await prisma.cart.findMany({
      where: {
        userId: Number(user.id),
      },
      select: {
        cartDetails: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });
    const cartDetails = cart.map((item) => item.cartDetails).flat();
    res.send(cartDetails);
  } catch (err) {
    console.log(err);
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
      include: {
        cart: {
          include: {
            cartDetails: true,
          },
        },
      },
    });
    const cart = user.cart.cartDetails;
    for (const item of cart) {
      const id = item.id;
      const detail = item;
      await prisma.product.update({
        where: {
          id: item.productId,
        },
        data: {
          quantity: {
            decrement: Number(item.quantity),
          },
          sold: {
            increment: Number(item.quantity),
          },
        },
      });

      const res = await prisma.detailCart.deleteMany({
        where: {
          cartId: Number(item.cartId),
        },
      });
    }

    res.send("ล้างตะกร้าเรียบร้อย");
  } catch (err) {
    console.error(" clearCart error:", err);
    res.status(500).json({ error: "CLEAR_CART_FAILED", message: err.message });
  }
};
