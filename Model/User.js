const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    level: { type: String, default: 'customer'}
}, { timeStamps: true })

userSchema.methods.toJSON = function () {
    const obj = this._doc
    delete obj.password
    delete obj.__v
    delete obj.updatedAt
    delete obj.createdAt
    return obj
}

const User = mongoose.model('User', userSchema);
module.exports = User;