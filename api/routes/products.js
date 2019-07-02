const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb){
        cb(null, file.originalname);
    }
});

//For Validation based on file type
/*const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }else{
        cb(null, false);
    }
}*/

const upload = multer({storage: storage, limit:{fileSize: 1024*1024*5}});

//GET all products
router.get('/', (req, res) => {
    Product.find()
        .select("name price _id productImage")
        .exec()
        .then(docs => {
            console.log(docs);
            const response = {
                count: docs.length,
                //products: docs
                //Another way of generating a response with more customized way
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
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
            console.log(err);
            res.status(500).json(err);
        });
});


//Post a product
router.post('/',checkAuth, upload.single('productImage'),(req, res) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Product has been saved!',
                //createdProduct: product
                createdProdcut: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//GET product by Id
router.get('/:productId', (req, res) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .select('-__v')
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                //res.status(200).json(doc);
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        description: 'Get All Products',
                        url: 'http://localhost:3000/products'
                    }
                });
            } else {
                res.status(404).json({ message: 'No Valid Record found for id - ' + req.params.productId })
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//DELETE PRODUCT By Product Id
router.delete("/:productId", checkAuth,(req, res) => {
    const productId = req.params.productId;
    Product.remove({ _id: productId })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Product deleted Successfully',
                requests: {
                    tyep: 'POST',
                    url: 'http://localhost:3000/products',
                    body: { name: 'String', price: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});


// UPDATE a Product
router.patch("/:productId", (req, res) => {
    const productId = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({ _id: productId }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Product Updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + productId
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;