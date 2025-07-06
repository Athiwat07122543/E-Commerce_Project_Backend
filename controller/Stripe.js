const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.checkOut = async (req, res) => {
  try {
    const { addressId, product } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
    });

    const cartId = await prisma.cart.findFirst({
      where: {
        userId: user.id,
      },
    });

    for (const item of product) {
      const checkProduct = await prisma.product.findFirst({
        where: {
          id: Number(item.id),
        },
        select: {
          id: true,
          name: true,
          quantity: true,
        },
      });
      if (checkProduct.quantity <= 0) {
        await prisma.detailCart.deleteMany({
          where: {
            productId: Number(item.id),
            cartId: cartId.id,
          },
        });

        return res.json({
          success: false,
          error: "PRODUCT_IS_OUT_OF_STOCK",
          message: `สินค้าชื่อ "${checkProduct.name}" หมด`,
        });
      }

      if (item.count > checkProduct.quantity) {
        return res.json({
          success: false,
          error: "PRODUCT_DONT_MATCH_QUANTITY",
          message: `สินค้าชื่อ "${checkProduct.name}" ไม่เพียงพอ กรุณาจัดการตะกร้าสินค้าใหม่`,
        });
      }
    }

    const listProduct = product.map((item) => ({
      price_data: {
        currency: "thb",
        product_data: {
          name: item.name,
        },
        unit_amount: Number(item.price),
      },
      quantity: Number(item.count),
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: listProduct,
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    const sessionId = session.id;
    const result = await prisma.order.create({
      data: {
        userId: Number(user.id),
        totalPrice: session.amount_total,
        addressId: Number(addressId),
        stripeId: session.id,
        stripeUrl: session.url,
        status: "ยังไม่ชำระเงิน",
      },
    });

    const detailOrder = await Promise.all(
      product.map((item) =>
        prisma.detailOrder.create({
          data: {
            productId: Number(item.id),
            price: Number(item.price),
            quantity: Number(item.count),
            orderId: result.id,
          },
        })
      )
    );
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.log(err);
  }
};

exports.checkOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await prisma.order.findFirst({
      where: {
        id: Number(id),
      },
    });
    res.send(result);
  } catch (err) {
    console.log();
  }
};

exports.webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const paymentData = event.data.object;
      console.log(event.data.object);
      const sessionId = paymentData.id;
      const result = await prisma.order.updateMany({
        where: {
          stripeId: sessionId,
        },
        data: {
          status: "ชำระเงินเรียบร้อย",
        },
      });
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send();
};
