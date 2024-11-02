const Users = require('../../models/usersModel')

async function checkAdminAuth(req, res, next) {
    if (!req.session.user) {
        return res.render('error', {
            message: 'Unauthorized!',
            redirectUrl: 'http://localhost:3000/login'
        });
    }
    const userId = req.session.user.id
    const user = await Users.findOne({_id:userId})
    if(user.role!=='admin'){
        return res.render('error', {
            message: 'Unauthorized!',
            redirectUrl: 'http://localhost:3000/login'
        });
    }
    next();
}

module.exports = checkAdminAuth;
