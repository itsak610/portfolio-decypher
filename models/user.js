var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new Schema({
    username: String,
    password: String,
    email: String,
    number: Number,
    name: String,
    school: String,
    level: Number,
    password1: String,
    verification: String,
    verified: {
        type: Boolean,
        default: false,
    },
    disqualified: {
        type: Boolean,
        default: false,
    },
    lastLevelOn: {
        type: Date,
        default: Date.now,
    },
    time: {
        type: Date,
    },
});

UserSchema.plugin(passportLocalMongoose, { usernameQueryFields: ["email"] });

module.exports = mongoose.model("User", UserSchema);
