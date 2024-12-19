const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{
    res.json({mensaje: "hoñadeqfwebfiuwrgfiorgiyg"})
})

router.get('/create', async(req, res)=>{
    
})

module.exports = router