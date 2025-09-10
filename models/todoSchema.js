const mongoose = require("mongoose");

const todoSchem = new mongoose.Schema({
    task:String,
    completed:{
        type:Boolean,
        default:false
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
})

const todoModel = mongoose.model("todos", todoSchem);
module.exports = todoModel;