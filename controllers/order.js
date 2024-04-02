const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.orderById = async (req, res, next, id) => {
    try {
        const order = await Order.findById(id)
            .populate("products.product", "name price")
            .exec();

        if (!order) {
            return res.status(400).json({
                error: "Order not found"
            });
        }

        req.order = order;
        next();
    } catch (err) {
        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

exports.create = (req, res) => {
    // console.log("CREATE ORDER: ", req.body);
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    order.save((error, data) => {
        if (error) {
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        res.json(data);
    });
};

exports.listOrders = (req, res) => {
    Order.find()
        .populate("user", "_id name address")
        .sort("-created")
        .exec()
        .then(orders => {
            res.json(orders);
        })
        .catch(err => {
            return res.status(400).json({
                error: errorHandler(err)
            });
        });
};

exports.getStatusValues = (req, res) => {
    res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
    Order.update(
        { _id: req.body.orderId },
        { $set: { status: req.body.status } },
        (err, order) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(order);
        }
    );
};