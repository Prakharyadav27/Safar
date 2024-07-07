const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Safar');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    phone: String,
    consent : {
        type: Boolean,
        default: true,
    },
    Posts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: []
    }],
    bio: String,
    img: {type: String, default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'},
    address: String,
    DOB:{type: Date, default: Date.now()}
    ,
    role: String
});

module.exports = mongoose.model('User', userSchema);