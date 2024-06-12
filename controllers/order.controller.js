const Order = require('../models/Order');
const {randomStringGenerator} = require("../utils/randomStringGenerator")
const productController = require('./product.controller');

const orderController = {}

orderController.createOrder = async (req, res) => {
    try {
        //프론트에서 데이터 보낸거 받아오기 userId, totalPrice, contact, orderList
        const { userId } = req
        const { shipTo, contact, totalPrice, orderList } = req.body
        //재고 확인 & 재고 업데이트
        const insufficientStockItems = await productController.checkItemListStock(orderList)

        // 재고가 충분하지 않는 아이템이 있었다 => 에러
        if (insufficientStockItems.length > 0) {
            const errorMessage = insufficientStockItems.map((item) => item.message).join(" ");
            throw new Error(errorMessage)
        }

        await productController.deductItemStock(orderList);
        // order 만들기
        const newOrder = new Order({
            userId,
            totalPrice,
            shipTo,
            contact,
            items: orderList,
            orderNum: randomStringGenerator()
        });

        await newOrder.save()
        res.status(200).json({status: "success", orderNum: newOrder.orderNum})

    } catch (error) {
        res.status(400).json({status: "fail", error: error.message})
    }
}

module.exports = orderController;