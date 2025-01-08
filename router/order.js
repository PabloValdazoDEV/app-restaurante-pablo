const express = require('express');
const isAdmin = require('../middelware/isAdmin');
const router = express.Router();

router.get('/queue', (req, res)=>{
    try {
        res.render('queue',{
            isAdmin: req.user.role === "ADMIN" ? true : false
        })
        
    } catch (error) {
        res.status(500).redirect('error-404')
    }
})
router.get('/stock',isAdmin, (req, res)=>{
    res.render('stock',{
        isAdmin: req.user.role === "ADMIN" ? true : false
    })
})


module.exports = router