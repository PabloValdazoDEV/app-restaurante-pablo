const express = require('express')
const router = express.Router()

const auth = require('./auth')
const order = require('./order')

router.use('/auth', auth)
router.use('/order', order)

module.exports = router