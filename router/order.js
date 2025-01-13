const express = require('express');
const isAdmin = require('../middelware/isAdmin');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const cloudinary = require('../config/cloudinary')
const prisma = require('../prisma/prisma')
const transporter = require('../config/nodemailer');
const { domain } = require('../config/config');
require('dotenv').config();

router.get('/queue', async (req, res)=>{
    try {
        const pedidos = await prisma.order.findMany({
            include:{
                products: {
                    include:{
                        product:true
                    }
                }
            }
        })
        const pedidoEntrada = pedidos.filter((pedEntre)=> pedEntre.status === "ENTRADA")
        // console.log(pedidoEntrada[0])
        const pedidoCocina = pedidos.filter((pedCoc)=> pedCoc.status === "COCINA")
        const pedidoRecoger = pedidos.filter((pedRec)=> pedRec.status === "RECOGER")
        const pedidoEntregado = pedidos.filter((pedEntrega)=> pedEntrega.status === "ENTREGADO")
        
        res.render('queue',{
            isAdmin: req.user.role === "ADMIN" ? true : false,
            pedidoEntrada,
            pedidoCocina,
            pedidoRecoger,
            pedidoEntregado
        })
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/error-404')
    }
})

router.put('/queue/a-cocina', async (req, res)=>{
    const { id } = req.body
    console.log(id)
    try {
        const cliente = await prisma.order.findUnique({where:{id}})
        await prisma.order.update({ 
            where: { id },
            data:{status: 'COCINA'}
        })
        const mailOptions = {
            from: `App Restaurante <${process.env.GMAIL_USER}>`,
            to: cliente.email,
            subject: 'Tu pedido está en Cocina 🧑🏽‍🍳',
            text: 'Tu pedido está en Cocina 🧑🏽‍🍳',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h1 style="text-align: center; color: #ff5722;">¡Tu pedido está en Cocina! 🧑🏽‍🍳</h1>
                <p style="font-size: 16px; color: #333; text-align: center;">
                    Nuestro equipo está preparando tu pedido con mucho cuidado y estará listo en <strong>15 minutos</strong>.
                </p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <img src="https://res.cloudinary.com/dt4l2p4pb/image/upload/v1736799141/iek9clhu3zsyeivh3jaj.webp" alt="Preparación en Cocina" style="max-width: 100%; height: auto; border-radius: 10px;" />
                </div>
        
                <p style="font-size: 16px; color: #333;">Para más detalles sobre tu pedido, puedes hacer clic en el enlace a continuación:</p>
        
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${domain}/carta/info-pedido/${cliente.id}" style="display: inline-block; padding: 10px 20px; background-color: #ff5722; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Ver Detalles del Pedido
                    </a>
                </div>
        
                <p style="text-align: center; font-size: 14px; color: #777;">Gracias por elegir nuestro restaurante. ¡Estamos deseando que disfrutes de tu comida! 🍽️</p>
            </div>
            `
        };
        

        await transporter.sendMail(mailOptions);

        res.redirect('/order/queue')
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/error-404')  
    }

})
router.put('/queue/a-recoger', async (req, res)=>{
    const { id } = req.body
    try {
        const cliente = await prisma.order.findUnique({where:{id}})
        await prisma.order.update({ 
            where: { id },
            data:{status: 'RECOGER'}
        })
        const mailOptions = {
            from: `App Restaurante <${process.env.GMAIL_USER}>`,
            to: cliente.email,
            subject: '¡Tu pedido está listo para recoger! 🛎️',
            text: '¡Tu pedido está listo para recoger! 🛎️',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h1 style="text-align: center; color: #28a745;">¡Tu pedido está listo! 🛎️</h1>
                <p style="font-size: 16px; color: #333; text-align: center;">
                    Ya puedes recoger tu pedido en el mostrador. ¡Gracias por elegirnos! 😊
                </p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <img src="https://res.cloudinary.com/dt4l2p4pb/image/upload/v1736799141/y0envwbqh4if4rg6ac5g.webp" alt="Pedido listo para recoger" style="max-width: 100%; height: auto; border-radius: 10px;" />
                </div>
        
                <p style="font-size: 16px; color: #333; text-align: center;">
                    Si necesitas más información sobre tu pedido, haz clic en el botón a continuación:
                </p>
        
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${domain}/carta/info-pedido/${cliente.id}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Ver Detalles del Pedido
                    </a>
                </div>
        
                <p style="text-align: center; font-size: 14px; color: #777;">¡Esperamos que disfrutes tu pedido! Si tienes dudas, no dudes en contactarnos. 🍽️</p>
            </div>
            `
        };
        

        await transporter.sendMail(mailOptions);
        res.redirect('/order/queue')
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/error-404')  
    }

})
router.put('/queue/terminado', async (req, res)=>{
    const { id } = req.body
    console.log(id)
    try {
        const cliente = await prisma.order.findUnique({where:{id}})
        await prisma.order.update({ 
            where: { id },
            data:{status: 'ENTREGADO'}
        })

        const mailOptions = {
            from: `App Restaurante <${process.env.GMAIL_USER}>`,
            to: cliente.email,
            subject: '¡Gracias por confiar en nosotros! 😁',
            text: '¡Gracias por confiar en nosotros! 😁',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h1 style="text-align: center; color: #007bff;">¡Gracias por confiar en nosotros! 😁</h1>
                <p style="font-size: 16px; color: #333; text-align: center;">
                    Nos alegra haberte servido. Esperamos que hayas disfrutado de tu experiencia en nuestro restaurante. ¡Te esperamos pronto!
                </p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <img src="https://res.cloudinary.com/dt4l2p4pb/image/upload/v1736799141/eodrwl9kzgfe6jcdrjrp.webp" alt="Gracias por tu visita" style="max-width: 100%; height: auto; border-radius: 10px;" />
                </div>
        
                <p style="text-align: center; font-size: 16px; color: #333;">
                    Si deseas conocer más sobre nuestras ofertas y novedades, no olvides visitar nuestra página web:
                </p>
        
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${domain}/carta" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Visitar nuestra página
                    </a>
                </div>
        
                <p style="text-align: center; font-size: 14px; color: #777;">¡Gracias de nuevo por elegirnos! 😊</p>
            </div>
            `
        };
        

        await transporter.sendMail(mailOptions);
        res.redirect('/order/queue')
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/error-404')  
    }

})

router.get('/stock',isAdmin, async (req, res)=>{

    try {
        const result = await prisma.product.findMany({})
        res.render('stock',{
            isAdmin: req.user.role === "ADMIN" ? true : false,
            products: result
        })
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/error-404')
    }
})

router.get('/stock/create', isAdmin,(req, res)=>{
    res.render('create-product',{
        isAdmin: req.user.role === "ADMIN" ? true : false
    })
})

router.post('/stock/create', upload.single('image'), async(req, res)=>{
    const { name, price, stock, description, imagen } = req.body
    try {
        const result = await cloudinary.uploader.upload(req.file.path)
        await prisma.product.create({
            data:{
                name,
                imagen: {
                    url: result.secure_url,
                    public_id: result.public_id
                },
                price: Number(price),
                stock: Number(stock),
                description
            }
        })
        res.redirect('/order/stock')
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/error-404')
    }
})

router.get('/stock/edit/:id', async(req, res)=>{
    const id_product = req.params.id
    try {
        const find_product = await prisma.product.findUnique({
            where:{
                id: id_product
            }
        })
        res.render('edit-products',{
            isAdmin: req.user.role === "ADMIN" ? true : false,
            product: find_product
        }
        )
    } catch (error) {
        res.status(500).redirect('error-404')
    }
})

router.put('/stock/edit/:id', upload.single('image'), async (req, res)=>{
    const id_product = req.params.id
    const { name, price, stock, description } = req.body
try {
    const find_image = await prisma.product.findUnique({
        where:{
            id: id_product
        }
    })
    if(req.file){
        const result = await cloudinary.uploader.upload(req.file.path)
        await prisma.product.update({
            where:{
                id: id_product
            },
            data:{
                name,
                imagen: {
                    url: result.secure_url,
                    public_id: result.public_id
                },
                price: Number(price),
                stock: Number(stock),
                description
            }
        })
    }else{
        const update_product = await prisma.product.update({
            where:{
                id: id_product
            },
            data:{
                name,
                price: Number(price),
                stock: Number(stock),
                description
            }
        })
    }
    
    if(req.file){
        cloudinary.uploader.destroy(find_image.imagen.public_id, function(result) { console.log(result) });
    }

    res.redirect('/order/stock')
} catch (error) {
    console.error(error)
    res.status(500).redirect('/error-404')
}
})

router.delete('/stock/delete/:id', async(req, res)=>{
    const id_product = req.params.id
    try {
        const find_image = await prisma.product.findUnique({
            where:{
                id: id_product
            }
        })
        cloudinary.uploader.destroy(find_image.imagen.public_id, function(result) { console.log(result) });
        await prisma.product.delete({
            where: {
                id: id_product
            }
        })
        res.redirect('/order/stock')
    } catch (error) {
        console.error(error)
        res.status(500).redirect('/error-404')
    }
})

router.get('/check-table',(req, res)=>{
    res.json({ updated: tableUpdated });
    tableUpdated = false
})


module.exports = router