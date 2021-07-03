const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // username: { NOW handled by PassportLocalMongoose * hashes and salts *
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // password: {
    //     type: String,
    //     required: true
    // },
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose);//provides athetication methods

module.exports = mongoose.model('User', userSchema);//means collection will be named users with a lower case u.