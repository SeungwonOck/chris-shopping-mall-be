const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const authController = require('../controllers/auth.controller');

router.get("/", authController.authenticate, orderController.getOrderList)
router.get("/me", authController.authenticate, orderController.getOrder)

router.post("/", authController.authenticate, orderController.createOrder)

router.put(
    "/:id",
    authController.authenticate,
    authController.checkAdminPermission,
    orderController.updateOrder
)
module.exports = router;