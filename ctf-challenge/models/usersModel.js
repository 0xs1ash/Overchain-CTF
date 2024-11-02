const mongoose=require('mongoose')
const {Schema} = mongoose
const UserSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    resetToken:{
        type:String
    },
    resetTokenExpires:{
        type:Date
    },
    role:{
        type:String,
        required:true
    },
    mails: {
        type: [Object],
        default: []
    },
    hints: {
        type: Object, default: {}
    },
    todos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Todos"
        }
    ],
    logs:[
        {
            type:Schema.Types.ObjectId,
            ref:'Logs'
        }
    ]
})

module.exports = mongoose.model('Users',UserSchema)