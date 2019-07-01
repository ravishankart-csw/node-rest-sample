const express = require('express');
const app = express();
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const morgan = require('morgan');
const bodyParser = require('body-parser')
const cors = require('cors');
const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://root:" + process.env.MONGO_ATLAS_PWD + "@demo-cluster-1-9mdui.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true })

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Adding CORS
app.use(cors());

//Routes for API
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);


//For Error Handling
app.use((req, res, next) => {
    const error = new Error('Resource Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;