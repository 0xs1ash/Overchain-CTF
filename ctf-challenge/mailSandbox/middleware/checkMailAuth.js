
function checkMailAuth(req, res, next) {
    if (!req.session.user) {
        return res.render('error', {
            message: 'Unauthorized!',
            redirectUrl: '/login'
        });
    }
    
    next();
}

module.exports = checkMailAuth;
