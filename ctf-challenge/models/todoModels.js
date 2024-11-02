const mongoose = require('mongoose')
const {Schema} = mongoose
const todoSchema = new Schema({
    list : {
        type:[String],
        default:[]
    },
    user:[
        {
            type:Schema.Types.ObjectId,
            ref:"Users"
        }
    ]
})
module.exports=mongoose.model('Todos',todoSchema)