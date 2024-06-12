const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const authController = require('../controllers/auth.controller');

router.get("/me", authController.authenticate, orderController.getOrder)
router.get("/", authController.authenticate, orderController.getOrderList)

router.post("/", authController.authenticate, orderController.createOrder)

module.exports = router;