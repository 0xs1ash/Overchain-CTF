const mongoose = require('mongoose')

const logSchema = mongoose.Schema({
    data:{
        type:[Object],
        default:[]
    },
    user:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Users'
        }
    ]
})

module.exports = mongoose.model('Logs',logSchema)