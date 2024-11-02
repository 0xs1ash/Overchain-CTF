const Users = require('../models/usersModel');


async function sendMail(data) {
    const { resetToken, username } = data;
    const user = await Users.findOne({ username });

    if (!user) {
        throw new Error('User not found');
    }
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const day = String(now.getDate()).padStart(2, '0'); 
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const date=`${month}.${day}.${year} ${hours}:${minutes}`; 
    const message = {
        'header': 'New Message For Resetting Password',
        "subject": 'Reset Your Password',
        "title": `Password Reset Request`,
        "date": `${date}`,
        'resetLink': `http://localhost:3000/reset-pass?token=${resetToken}`,
        "content": `
            <p>Please click the link below to reset your password:</p>
            <a href="http://localhost:3000/reset-pass?token=${resetToken}" id="reset-Link">Reset Password</a>
            <br>`,
        "footer": `Your reset token is: <span class="highlight">${resetToken}</span>
            <p><i>This token will expire after 5 minutes, be quick!</i><br>Best regards,<br><b>Slash</b></p>`,
        'checked':false
    };
    
    
    user.mails.push(message);
    await user.save();
}


module.exports = sendMail