const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');
const Schema = mongoose.Schema;
const orderSchema = new Schema(
    {
        shipTo: { type: Object, required: true },
        contact: { type: Object, required: true },
        orderNum: { type: String },
        userId: { type: mongoose.ObjectId, ref: User },
        totalPrice: { type: Number, required: true, default: 0 },
        status: { type: String, default: 'preparing' },
        items: [{
            productId: { type: mongoose.ObjectId, ref: Product },
            price: { type: Number, required: true},
            size: { type: String, required: true },
            qty: { type: Number, default: 1, required: true}
        }]
        
    },
    { timestamps: true }
)

orderSchema.methods.toJSON = function () {
    const obj = this._doc
    delete obj.__v
    delete obj.updatedAt
    return obj
}

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;