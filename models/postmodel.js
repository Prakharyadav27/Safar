const mongoose = require('mongoose');



const postSchema = new mongoose.Schema({
    title: String,
    like:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            unique: true,
            default: []
        }
    ],
    comment:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
            ,
            default: []
        }
    ],
    file : String,
    cost : String,
    description : String,
    city : String,
    cordinate : String,
    author : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

});

module.exports = mongoose.model('Post', postSchema);