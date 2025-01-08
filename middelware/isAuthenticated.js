function isAuthenticated(req, res, next){
    if(req.user){
        return next()
    }
    return res.redirect('/error-404')
}

module.exports = isAuthenticated