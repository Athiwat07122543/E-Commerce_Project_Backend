const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { DateTime } = require("luxon");

exports.listUser = async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        enabled: true,
        email: true,
        role: true,
      },
    });

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "LIST_USER_ERROR", message: "ListUser ทำงานผิดพลาด" });
  }
};

exports.editUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { email, role, enabled } = req.body;
    const data = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        email: email,
        role: role,
        enabled: enabled,
      },
    });
    res.send(data);
  } catch (err) {
    console.log(err);
  }
};
exports.updateStock = async (req, res) => {
  try {
    const { username } = req.user;

    const user = await prisma.user.findFirst({
      where: {
        username: username,
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
      await prisma.product.update({
        where: {
          id: item.productId,
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }
    res.send("work1");
  } catch (err) {
    console.log(err);
  }
};

exports.getOrder = async (req, res) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const setStatus = status ? { status: status } : {};

    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        skip: skip,
        take: limit,
        where: setStatus,
        orderBy: {
          id: "asc",
        },
        include: {
          orderDetails: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          address: true,
        },
      }),
      prisma.order.count(),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    res.json({ orders, totalPages });
  } catch (err) {
    console.log(err);
  }
};

exports.getOrderBy = async (req, res) => {
  try {
    const userId = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
      select: {
        id: true,
      },
    });

    const order = await prisma.order.findMany({
      where: {
        userId: Number(userId.id),
      },
      include: {
        address: true,
        orderDetails: {
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

    res.json(order);
  } catch (err) {
    console.log(err);
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id, status, shippingnumber } = req.body;

    const userId = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
      select: {
        id: true,
      },
    });

    const updateOrder = await prisma.order.update({
      where: {
        id: Number(id),
      },
      data: {
        status: status,
        shippingnumber: shippingnumber,
      },
    });

    res.json({ message: "ok" });
  } catch (err) {
    console.log(err);
  }
};

exports.ordersToDay = async (req, res) => {
  try {
    const start = DateTime.now().setZone("Asia/Bangkok").startOf("day").toUTC();
    const end = DateTime.now().setZone("Asia/Bangkok").endOf("day").toUTC();

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start.toJSDate(),
          lte: end.toJSDate(),
        },
      },
    });

    res.json(orders);
  } catch (err) {
    console.log(err);
  }
};

exports.totalSalesToDay = async (req, res) => {
  try {
    const start = DateTime.now().setZone("Asia/Bangkok").startOf("day").toUTC();
    const end = DateTime.now().setZone("Asia/Bangkok").endOf("day").toUTC();
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start.toJSDate(),
          lte: end.toJSDate(),
        },
        status: "ชำระเงินเรียบร้อย",
      },
    });

    const totalPrice = orders.reduce(
      (sum, orders) => sum + orders.totalPrice,
      0
    );

    res.json(totalPrice);
  } catch (err) {
    console.log(err);
  }
};

exports.ordersMonthlySales = async (req, res) => {
  try {
    const start = DateTime.now()
      .setZone("Asia/Bangkok")
      .startOf("year")
      .toUTC();
    const end = DateTime.now().setZone("Asia/Bangkok").endOf("year").toUTC();

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "ชำระเงินเรียบร้อย",
      },
    });

    // แยกที่ละเดือน
    const monthlySales = Array(12).fill(0);

    orders.forEach((order) => {
      const month = DateTime.fromJSDate(order.createdAt).setZone(
        "Asia/Bangkok"
      ).month;
      monthlySales[month - 1] += order.totalPrice;
    });

    res.json({
      labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      data: monthlySales,
    });
  } catch (err) {
    console.log(err);
  }
};
