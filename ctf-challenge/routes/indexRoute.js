const express = require('express')
const router = express.Router()
const {checkAuth} = require('../middleware/checkAuth')
const Todos = require('../models/todoModels')
const Users = require('../models/usersModel')
const axios  = require('axios')
const crypto =require('crypto')


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

//=========================================TODO=========================================

router.get('/',(req,res)=>{
    const user = req.session ? req.session.user : undefined
    res.render('index',{user})
})

router.get('/todo',checkAuth,async (req,res)=>{
    const csrfToken = crypto.randomBytes(32).toString('hex')
    req.session.csrfToken=csrfToken
    res.render('todo',{user:req.session.user,csrfToken})
})

router.post('/getHints', async (req, res) => {
    const reqHint = req.body.hint; 
    const username = req.session.user?.username
    const user = await Users.findOne({ username: username });
    
    if (!user) {
        return res.status(401).json({
            'type': 'danger',
            'message': 'You are Unauthenticated! Please Login.'
        });
    }
    
    const hint = user.hints && user.hints[reqHint];
    if (!hint) {
        return res.status(400).json({
            'type': 'danger',
            'message': 'Bad Request! Hint not found.'
        });
    }

    let bufferObj = Buffer.from(hint, "base64");
    let decodedHint = bufferObj.toString("utf8");
    return res.status(200).json({
        'type': 'info',
        'message': decodedHint
    });
});

router.get('/getTodos',csrfValidate,checkAuth,async (req,res)=>{
    const  username = req.session.user.username
    const user = await Users.findOne({username:username})
    if(!user){
        return res.redirect('/logout')
    }
    let todos = await Todos.findOne({user:user._id})
    if(!todos){
        todos = new Todos({user:user._id,list:[]})
        await todos.save()
    }
    return res.status(200).json({
        todos:todos.list
    })
})

router.post('/addTodo',csrfValidate,checkAuth,async (req,res)=>{
    const todoText = req.body.todo
    if(!todoText){
        return res.status(400)
    }
    const username = req.session.user.username
    const user = await Users.findOne({username:username}) 
    
    if(!user){
        return res.redirect('/logout')
    }
    let todos = await Todos.findOne({ user: user._id });
    if(!todos){
        todos = new Todos({ user: user._id, list: [] });
    }
    todos.list.push(todoText)
    await todos.save()
    const todoList = {
        'todos':todos.list
    }
    res.json(todoList)
})

router.get('/clearTodo',csrfValidate,checkAuth,async (req,res)=>{
    const username = req.session.user.username
    const user = await Users.findOne({username:username})
    if(!user){
        return res.redirect('/logout')
    }

    let todos = await Todos.findOne({user:user._id})
    todos.list=[]
    await todos.save()
    return res.status(200).json({message:'ok'})
})


//=========================================ADMIN CONTACT=========================================
router.get('/sendAdmin', checkAuth,(req,res)=>{
    const csrfToken = crypto.randomBytes(32).toString('hex')
    req.session.csrfToken=csrfToken
    return res.render('sendAdmin',{csrfToken})
})

router.post('/adminContact',csrfValidate,checkAuth,async (req,res)=>{
    const adminContactURL = 'http://localhost:5000/logSave'

    //Check User Input
    let message = req.body.message
    if(message.trim()===""){
        return res.status(500).json({
            type:'danger',
            message:'Please wright something.Message can not be send empty!!'
        })
    }
    if(message.startsWith('http://') || message.startsWith('https://')){
        return res.status(500).json({
            type:'danger',
            message:'You are not allowed to send URLs!'
        })    
    }

    //Encode input:
    message = encodeURI(message)

    
    //DATE FIELD
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const day = String(now.getDate()).padStart(2, '0'); 
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const date=`${month}.${day}.${year} ${hours}:${minutes}`; 


    //Message id
    const messageId = crypto.randomBytes(64).toString('hex')
    const userMessage = {
        messageId:messageId,
        checked:false,
        user:req.session.user.username,
        message:message,
        date:date
    }


    //Send message
    axios.post(adminContactURL,{
        data:{
            userMessage:userMessage
        }
    },{
        headers:{
            'Cookie': req.headers.cookie
        },
        withCredentials: true 
    })

    .then((response) =>{        
        return res.status(response.data.status).json({
            type:response.data.type,
            message:response.data.message
        })    
    }).catch((err)=>{
        res.status(401).json({
            type:'danger',
            message:'Error occured in sending message to admin!'
        })
    })
    .finally(()=>{
        console.log('[!] Message received!')
    })

})

router.get('/error',(req,res)=>{
    res.render('error')
})

module.exports=router