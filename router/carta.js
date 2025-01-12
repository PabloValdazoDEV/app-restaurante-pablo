const express = require('express');
const prisma = require('../prisma/prisma');
const transporter = require('../config/nodemailer');
const router = express.Router();
require('dotenv').config();

router.get('/', async (req, res)=>{

    try {
        const allProducts = await prisma.product.findMany({})
        res.render('carta',{
            layout: 'cliente',
            products: allProducts
        })
    } catch (error) {
    console.error(error)
    res.status(500).redirect('/error-404')
    }
})

router.post('/crear-pedido', async (req, res)=>{
    const {email, description, quantityAll} = req.body

    try {

        const pedidosTotales = await prisma.order.findMany({
            where:{
                status: 'ENTREGADO'
            }
        })
        if(pedidosTotales.length >= 11){
            return res.status(500).redirect('/carta/maximos-pedidos')
        }

        const productsArray =  JSON.parse(quantityAll);
        const newOrder = await prisma.order.create({
            data:{
                email,
                description,
                products:{
                    create: productsArray 
                    ? productsArray.map(product => ({
                        productId: product.id, 
                        quantity: parseInt(product.quantity, 10),
                      }))
                    : []
                }
            }
        })

        
        const pedido = await prisma.order.findUnique({
            where:{
                id: newOrder.id
            },
            include:{
                products: {
                    include:{
                        product:true
                    }
                }
            }
            
        })
        
        console.log(pedido)

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'App Restaurante',
            text: 'Pedido realizado ',
            html:`
            <h1>Pedido realizado</h1><br>
            <h3>Tu pedido esta en ${pedido.status === 'ENTRADA' ? '25 minutos': "15 minutos"}</h3>
            <p>Has pedido:</p>
            <ul>
            ${pedido.products.map(el => `<li>${el.product.name} - Cant. ${el.quantity} - ${el.product.price}€ /ud</li>`).join('')}
            </ul>
            <p>Total a pagar: <b>${pedido.products.reduce((acc, value)=> acc + (value.quantity * value.product.price),0)}€</b></p>
            <p>Para más información sobre tu pedido, haz <a href="http://localhost:3000/carta/info-pedido/${pedido.id}">click aquí</a></p>
            `
        }

       await transporter.sendMail(mailOptions);
        res.redirect(`/carta/info-pedido/${newOrder.id}`)
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/error-404')
    }
})


router.get('/info-pedido/:id', async(req,res)=>{
    const { id } = req.params

    try {
        const pedido = await prisma.order.findUnique({
            where:{
                id
            },
            include:{
                products: {
                    include:{
                        product:true
                    }
                }
            }

        })
       
        res.render('info-pedido',{
            pedido,
            total: pedido.products.reduce((acc, value)=> acc + (value.quantity * value.product.price),0),
            layout: 'cliente'
        }
        )
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/error-404')
    }
})

router.get('/maximos-pedidos', (req, res)=>{
    res.render('maximos-pedidos',{
        layout: 'cliente'
    })
})

module.exports = router