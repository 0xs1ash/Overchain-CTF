const express = require('express')
const router = express.Router()
const Users = require('../../models/usersModel')
const checkMailAuth = require('../middleware/checkMailAuth')
const crypto = require('crypto')
const bcrypt=require('bcrypt')
const htmlEntities = require('html-entities')

const csrfValidate = (req,res,next)=>{
    const headerToken = req.headers['csrf-token'] || req.headers['CSRF-TOKEN'];
    const sessionToken = req.session.csrfToken

    if(!headerToken || headerToken!==sessionToken){
        return res.status(403).json({
            type: 'danger',
            message: 'Invalid CSRF token.',
        });
    }
    next()
}


//=========================================LOGIN=========================================
router.get('/',(req,res)=>{
    return res.redirect('/login')
})

router.get('/login',(req,res)=>{
    const csrfToken = crypto.randomBytes(32).toString('hex')
    req.session.csrfToken=csrfToken
    return res.render('login',{csrfToken})
})

router.get('/panel',checkMailAuth, async (req,res)=>{

    let username =req.session.user.username
    const user = await Users.findOne({
        username:username
    })   
    username = decodeURIComponent(username)
    const csrfToken = crypto.randomBytes(32).toString('hex')
    req.session.csrfToken=csrfToken

    //CSP-NONCE 
    let nonce = Math.floor(Math.random() * 10)
    nonce = 'overchain'+String(nonce)

    if(user.mails.length>0){
        return res.render('panel',{csrfToken,nonce,username})
    }
    

    return res.render('panel',{csrfToken,nonce})
})

router.post('/login',csrfValidate,async (req,res)=>{
    const {username,password} = req.body
    if(!(username && password)){
        return res.status(400).json({
            'type':'danger',
            'message':'Username and Password field must be provided!'
        })
    }
    const user = await Users.findOne({username:username})
    if(!user){
        return res.status(401).json({
            'type':'danger',
            'message':'Username or Password is invalid!'
        })
    }
    const checkUser = await bcrypt.compare(password, user.password);
    if(checkUser){
        req.session.user={
            id:user._id,
            username:user.username
        }
        return res.status(302).json({
            type:'success'
        })
    }
    return res.status(401).json({
        'type':'danger',
        'message':'Unauthorized!'
    })
})
//=========================================GET MAILS=========================================
router.get('/getMails',csrfValidate,checkMailAuth,async (req,res)=>{
    const username = req.session.user.username;
    const user = await Users.findOne({username:username})
    if(!user){
        return res.redirect('/logout')
    }  
    return res.status(200).json({
        data:user.mails.reverse(),
    })
})

router.get('/logout',checkMailAuth,(req,res)=>{
    req.session.destroy()
    res.clearCookie('cookie')
    return res.redirect('/login')
})
module.exports = router