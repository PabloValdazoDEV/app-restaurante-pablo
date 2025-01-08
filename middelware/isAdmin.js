function isAdmin(req, res, next){

    if(req.user){
        if(req.user.role === 'ADMIN'){
            return next()
        }
    }
    return res.redirect('/order/queue')

}

module.exports = isAdmin