const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product')

//Post an Order
router.post('/', (req, res) => {
    Product.findById(req.body.product)
        .then(product => {
            if (!product) {
                return res.status(404).json({ message: 'Product Not Found' })
            }
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.product
            });
            return order.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'An Order has been created',
                createdOrder: {
                    _id: result._id,
                    quantity: result.quantity,
                    product: req.body.product,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});

//GET All Orders
router.get('/', (req, res) => {
    Order.find()
        .select("_id quantity product")
        .populate('product', '-__v')
        .exec()
        .then(docs => {
            const response = {
                Count: docs.length,
                Orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        quantity: doc.quantity,
                        product: doc.product,
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/products/" + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

//GET Order By Id
router.get('/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .populate('product', '-__v')
        .select('-__v')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    order: doc,
                    request: {
                        type: 'GET',
                        description: 'Get All Orders',
                        url: 'http://localhost:3000/orders'
                    }
                });
            } else {
                res.status(404).json({ message: 'No Valid Record found for id - ' + req.params.orderId })
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;