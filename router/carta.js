const express = require("express");
const prisma = require("../prisma/prisma");
const transporter = require("../config/nodemailer");
const { domain } = require("../config/config");
const router = express.Router();

require("dotenv").config();

router.get("/", async (req, res) => {
  try {
    const allProducts = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
    });

    res.render("carta", {
      layout: "cliente",
      products: allProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).redirect("/error-404");
  }
});

router.post("/crear-pedido", async (req, res) => {
  const { email, description, quantityAll } = req.body;

  try {
    const pedidosTotales = await prisma.order.findMany({
      where: {
        status: "ENTRADA",
      },
    });

    if (pedidosTotales.length >= 11) {
      return res.status(500).redirect("/carta/maximos-pedidos");
    }

    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        stock: true,
      },
    });

    const arraySinStock = [];

    const quantityParsed = JSON.parse(quantityAll);

    for (let i = 0; i < allProducts.length; i++) {
      const currentProduct = allProducts[i];
      quantityParsed.forEach((el) => {
        if (el.id === currentProduct.id && el.quantity > currentProduct.stock) {
          arraySinStock.push(currentProduct);
        }
      });
    }

    if (arraySinStock.length) {
      const allProducts = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
      });
      return res.render("carta", {
        layout: "cliente",
        products: allProducts,
        sinStock: arraySinStock,
      });
    }

    for(i=0; i < quantityParsed.length; i++){
        await prisma.product.update({
        where:{
            id: quantityParsed[i].id
        },
        data:{
            stock: {
                decrement: quantityParsed[i].quantity
            }
        }
        })
    }

    const productsArray = JSON.parse(quantityAll);
    const newOrder = await prisma.order.create({
      data: {
        email,
        description,
        products: {
          create: productsArray
            ? productsArray.map((product) => ({
                productId: product.id,
                quantity: parseInt(product.quantity, 10),
              }))
            : [],
        },
      },
    });

    const pedido = await prisma.order.findUnique({
      where: {
        id: newOrder.id,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    const mailOptions = {
      from: `App Restaurante <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Tu Pedido Está en Camino 🍽️",
      text: "Pedido realizado 📋",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
              <h1 style="text-align: center; color: #E74C3C; font-size: 24px;">¡Gracias por tu pedido! 🍽️</h1>
              <p style="font-size: 16px; color: #333; text-align: center; margin-bottom: 20px;">Tu pedido estará listo en <strong>25 minutos</strong>.</p>
              
              <h3 style="color: #E74C3C; border-bottom: 2px solid #E74C3C; padding-bottom: 5px;">Resumen de tu pedido:</h3>
              <ul style="list-style-type: none; padding: 0; margin: 0;">
                  ${pedido.products
                    .map(
                      (el) => `
                      <li style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background-color: #fff;">
                          <span style="font-weight: bold; font-size: 16px;">${el.product.name}</span><br>
                          <span style="font-size: 14px;">Cantidad: ${el.quantity} | Precio: ${el.product.price}€/ud</span>
                      </li>`
                    )
                    .join("")}
              </ul>
              
              <p style="font-size: 18px; color: #333; text-align: center; margin: 20px 0;"><strong>Total a pagar: <span style="color: #E74C3C;">${pedido.products.reduce(
                (acc, value) => acc + value.quantity * value.product.price,
                0
              )}€</span></strong></p>
              
              <div style="text-align: center; margin: 30px 0;">
                  <a href="${domain}/carta/info-pedido/${
        pedido.id
      }" style="display: inline-block; padding: 12px 25px; background-color: #E74C3C; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                      Ver Detalles del Pedido
                  </a>
              </div>
      
              <p style="text-align: center; font-size: 14px; color: #777; margin-top: 20px;">Si tienes alguna duda, no dudes en contactarnos. ¡Buen provecho! 😊</p>
          </div>
      `,
  };
  
    await transporter.sendMail(mailOptions);
    global.tableUpdated = true;
    res.redirect(`/carta/info-pedido/${newOrder.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).redirect("/error-404");
  }
});

router.get("/info-pedido/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    res.render("info-pedido", {
      pedido,
      total: pedido.products.reduce(
        (acc, value) => acc + value.quantity * value.product.price,
        0
      ),
      layout: "cliente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).redirect("/error-404");
  }
});

router.get("/maximos-pedidos", (req, res) => {
  res.render("maximos-pedidos", {
    layout: "cliente",
  });
});

module.exports = router;
