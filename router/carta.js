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
    console.log(req.body)
    try {
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
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'App Restaurante',
            text: 'Pedido realizado '
        }

       await transporter.sendMail(mailOptions);
       const queryParams = new URLSearchParams({id: newOrder.id, status: newOrder.status}).toString();
        res.redirect(`/carta/gracias?${queryParams}`)
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/error-404')
    }
})

router.get('/gracias', (req,res)=>{
    const { id, status } = req.query;
    res.render('pedido-realizado', {
        layout: 'cliente',
        id,
        status
    })
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
        console.log(pedido.products[0].quantity)
        console.log(pedido.products[0].product.price)
        res.render('info-pedido',{
            pedido,
        }
        )
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/error-404')
    }
   
})

module.exports = router