const express = require('express')
const router = express.Router()
const {checkAuth,checkResetToken} = require('../middleware/checkAuth')
const crypto =require('crypto')
const sendMail = require('../utils/sendMail')
const Users = require('../models/usersModel')
const Todos = require('../models/todoModels')
const bcrypt = require('bcrypt')
const csrfValidate = (req,res,next)=>{
    const headerToken = req.headers['csrf-token'] || req.headers['CSRF-TOKEN'];
    const sessionToken = req.session.csrfToken

    if(!headerToken || headerToken!==sessionToken){
        return res.status(403).json({
            type: 'Error!',
            message: 'Invalid CSRF token.',
        });
    }
    next()
}

//=========================================LOGIN=========================================
router.get('/login',(req,res)=>{
    if(req.session.user){
        return res.redirect('/todo')
    }
    const csrfToken = crypto.randomBytes(32).toString('hex')
    req.session.csrfToken=csrfToken
    return res.render('login',{csrfToken})
})

router.post('/login',csrfValidate,async (req,res)=>{
    const {username,password} = req.body
    if(!(username && password)){
        return res.status(400).json({
            'type':'warning',
            'message':'Username and Password place are required!'
        })
    }
    const user = await Users.findOne({username:username})
    if(!user){
        return res.status(401).json({
            'type':'danger',
            'message':'Username or Password is incorrect'
        })
    }
    const checkUser = await bcrypt.compare(password, user.password);
    if (checkUser){
        req.session.user={
            id:user._id,
            role:user.role,
            username:user.username
        }

        return res.status(200).json({ type: 'success' });
        
    }
    return res.status(401).json({
        'type':'danger',
        'message':'Unauthorized!'
    })
})


//======================================RESET-PASS=====================================
router.get('/reset',(req,res)=>{
    return res.render('reset')
})

router.post('/reset',async (req,res)=>{
    const username = req.body.username
    if(!username){
        return res.status(400).json({
            'type':'danger',
            'message':'Username will be provided!'
        })
    }
    const user = await Users.findOne({username:username})
    if(!user){
        return res.status(404).json({
            'type':'danger',
            'message':"There's no such user here!"
        })
    } 
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetToken=resetToken
    user.resetTokenExpires=new Date(Date.now()+60*1000*5)
    await user.save()
    sendMail(user)
    return res.status(200).json({
        'type':'success',
        'message':'Please check your mailbox, the link has been sent to your account.'
    })
})

router.get('/reset-pass',checkResetToken,(req,res)=>{
    const token = req.query.token;
    const csrfToken = crypto.randomBytes(32).toString('hex')
    req.session.csrfToken=csrfToken
    return res.render('reset-pass',{token:token,csrfToken})
})

router.post('/reset-pass',csrfValidate,checkResetToken,async (req,res)=>{
    const {password,confirm,token} = req.body
    const user = await Users.findOne({resetToken:token})
    if(!token || !user){
        return res.status(401).json({
            'message': 'Token is invalid!'
        });
    }
    if(!password && !confirm){
        return res.status(400).json({
            'type':'warning',
            'message':'Please do not leave the sections empty.'
        })
    }
    if(password!==confirm){
        return res.status(400).json({
            'type':'danger',
            'message':'Password and Confirm do not match'
        })
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password=hashedPassword
    user.resetToken=undefined
    user.resetTokenExpires=undefined
    await user.save()
    req.session.user=undefined
    return res.status(302).json({
        message:'Password changed!'
    })
})

//=======================================PROFILE=========================================
router.get('/profile',checkAuth,async(req,res)=>{
    const username = req.session.user.username
    const user = await Users.findOne({username:username})
    if(!user){
        return res.render('error', {
            message: 'Unauthorized!',
            redirectUrl: '/login'
        });
    }
    let todos = await Todos.findOne({ user: user._id });
    if(!todos){
        todos = new Todos({ user: user._id, list: [] });
    }
    res.render('profile',{todos:todos.list,username:username,user:req.session.user})
})


//=======================================CHANGE USERNAME=========================================
router.get('/changeUsername',checkAuth,async (req,res)=>{
    const username = req.session.user.username
    let newUsername = req.query.newUsername
    if(!newUsername && !username){
        return res.redirect('/login')
    }
    const user = await Users.findOne({username:username})
    if(!user){
        return res.render('error', {
            message: 'Unauthorized!',
            redirectUrl: '/login'
        });
    }
    const check = await Users.findOne({username:newUsername})
    if(check){
        return res.status(400).json({
            type:'warning',
            message:'This username has been taken.Please try another one!'
        })
    }

    newUsername=decodeURI(newUsername)
    user.username=newUsername
    await user.save()
    req.session.user={
        id:user._id,
        role:user.role,
        username:newUsername
    }
    return res.status(200).json({
        type:'success',
        newUsername:newUsername,
        message:'Username successfuly changed.!'
    })
})

//=========================================LOGOUT=========================================
router.get('/logout',checkAuth,(req,res)=>{
    req.session.destroy()
    res.clearCookie('cookie')
    return res.redirect('/login')
})


module.exports=router