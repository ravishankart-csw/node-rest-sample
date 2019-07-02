const express = require('express');
const router = express.Router();
const orderController = require('../controller/orders');
const checkAuth = require('../middleware/check-auth');

//Post an Order
router.post('/', checkAuth, orderController.post_orders);

//GET All Orders
router.get('/', checkAuth, orderController.orders_get_all);

//GET Order By Id
router.get('/:orderId', checkAuth, orderController.orders_by_id);


module.exports = router;