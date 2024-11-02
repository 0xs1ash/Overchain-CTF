const express = require('express')
const  checkAdminAuth  = require('../middleware/checkAuth')
const {checkAuth} = require('../../middleware/checkAuth')
const router = express.Router()
const Users  = require('../../models/usersModel')
const Logs  = require('../../models/logModels')
const fs =  require('fs').promises
const crypto = require('crypto')
const dotenv = require('dotenv');
dotenv.config({path:'../../config/.env'});


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

//=========================================ADMIN PANEL=========================================
router.get('/admin',checkAdminAuth,(req,res)=>{
    const csrfToken = crypto.randomBytes(32).toString('hex')
    req.session.csrfToken=csrfToken
    res.render('admin',{csrfToken})
})


//============================================LOGS=============================================
router.get('/getLogs',csrfValidate,checkAdminAuth,async(req,res)=>{
    const id = req.session.user.id
    const user = await Users.findOne({_id:id})
    let logs = await Logs.findOne({user:user._id})
    if(!logs){
        logs = new Logs({user:user._id,data:[]})
    }
    const FLAG = process.env.FLAG
    await logs.save()
    return res.status(200).json({
        user:user,
        logs:logs.data.reverse(),
        flag:FLAG
    })
})


router.post('/logSave',checkAuth,async (req,res)=>{
    const userMessage = req.body.data.userMessage
    const user = await Users.findOne({username:'admin'})
    if(!user){
        return res.status(400).json({
            status:400,
            type:'warning',
            message:'Bad request!.\nIf you see this message,so you did anyting right for getting flag,please restart server again.:)'
        })
    }
    //Save Logs
    const path = (__dirname+'/../../logs/admin.log')
   
    try{
        await fs.appendFile(path,JSON.stringify(userMessage)+'\n')
        console.info('[+] File written successfully!');
    }catch(err){
        console.error('[-] Error: ',err.message)
        return res.status(500).json({
            status: 500,
            type: 'danger',
            message: 'Internal Server Error! Could not write to log file.'
        });
    }


    let logs = await Logs.findOne({user:user._id})
    if(!logs){
        logs = new Logs({user:user._id,data:[]})
    }
    logs.data.push(userMessage)
    await logs.save()
    return res.status(200).json({
        status:200,
        type:'success',
        message:'Message Successfuly sent!'
    })
})

module.exports = router