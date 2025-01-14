const express = require('express')
const router = express.Router()
const isAuthenticated = require('../middelware/isAuthenticated')

const auth = require('./auth')
const order = require('./order')
const carta = require('./carta')

router.get('/error-404', (req, res)=>{
res.render('error-404',{
    layout:'cliente'
})
})

router.use('/carta', carta)
router.use('/auth', auth)
router.use('/',isAuthenticated)
router.use('/order', isAuthenticated)
router.use('/order', order)

module.exports = router