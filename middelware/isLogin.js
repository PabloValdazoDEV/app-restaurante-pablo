function isLogin(req, res, next){

    if(req.user){
        return res.redirect('/order/queue')
    }
    return next()
}

module.exports = isLogin