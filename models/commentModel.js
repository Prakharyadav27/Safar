const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
   by: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       default: null
   },
   name: String
   ,
   img:{
    type: String,
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
   },
   
    comment: {
         type: String,
         default: ''
    },

});

module.exports = mongoose.model('Comment', commentSchema);