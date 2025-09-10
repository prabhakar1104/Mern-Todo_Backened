const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: String,
        expiry: Date
    }
});

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;