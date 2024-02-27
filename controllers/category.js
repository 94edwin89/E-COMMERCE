const Category = require('../models/category');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    const category = new Category(req.body);
    category.save()
        .then(savedCategory => {
            res.json(savedCategory); // Return the saved category directly
        })
        .catch(err => {
            // Apply errorHandler to handle various errors
            res.status(400).json({
                error: errorHandler(err)
            });
        });
};
