const Users = require('../models/usersModel')

function checkAuth(req, res, next) {
    if (!req.session.user) {
        return res.render('error', {
            message: 'Unauthorized!',
            redirectUrl: '/login'
        });
    }
    next();
}
async function checkResetToken(req, res, next) {
    let token
    if(!req.query.token){
        token=req.body.token
    }else if(!req.body.token){
        token=req.query.token
    }else{
        token=undefined
    }
    if (!token) {
        return res.render('error', {
            message: 'Token not provided!',
            redirectUrl: '/login'
        });
    }
    const user = await Users.findOne({resetToken:token})
    if(!user){
        return res.render('error', {
            message: 'Token is not valid!',
            redirectUrl: '/login'
        });
    }
    if(user.resetTokenExpires && user.resetTokenExpires<Date.now()){
        user.resetToken=undefined
        user.resetTokenExpires=undefined
        await user.save()
        return res.render('error', {
            message: 'Token is not valid!',
            redirectUrl: '/login'
        });
    }
    next()
}

module.exports = {checkAuth,checkResetToken};
