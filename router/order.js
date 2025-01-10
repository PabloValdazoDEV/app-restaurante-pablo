const express = require('express');
const isAdmin = require('../middelware/isAdmin');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const cloudinary = require('../config/cloudinary')
const prisma = require('../prisma/prisma')
router.get('/queue', (req, res)=>{
    try {
        res.render('queue',{
            isAdmin: req.user.role === "ADMIN" ? true : false
        })
        
    } catch (error) {
        res.status(500).redirect('error-404')
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
        res.status(500).redirect('error-404')
    }
})

router.get('/stock/create', isAdmin,(req, res)=>{
    res.render('create-product',{
        isAdmin: req.user.role === "ADMIN" ? true : false
    })
})

router.post('/stock/create', upload.single('image'), async(req, res)=>{
    const { name, price, stock, description } = req.body
    try {
        const result = await cloudinary.uploader.upload(req.file.path)
        const result_product = await prisma.product.create({
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

router.put('/stock/edit/:id', async (req, res)=>{
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const id_product = req.params.id
    const { name, price, stock, description, imagen } = req.body
try {
    const find_image = await prisma.product.findUnique({
        where:{
            id: id_product
        }
    })
    console.log(find_image)
    if(req.file){
        const result = await cloudinary.uploader.upload(req.file.path)
        const update_product = await prisma.product.update({
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
    res.status(500).redirect('error-404')
}
})


module.exports = router