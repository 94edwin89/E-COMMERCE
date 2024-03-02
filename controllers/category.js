const Category = require('../models/category');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.categoryById = (req, res, next, id) => {
    Category.findById(id)
        .then(category => {
            if (!category) {
                return res.status(404).json({
                    error: 'Category not found'
                });
            }
            req.category = category;
            next();
        })
        .catch(err => {
            return res.status(400).json({
                error: "Category does not exist!!"
            });
        });
};

exports.create = (req, res) => {
    const category = new Category(req.body);
    category.save()
        .then(savedCategory => {
            res.json(savedCategory);
        })
        .catch(err => {
            res.status(400).json({
                error: errorHandler(err)
            });
        });
};

exports.read = (req, res) => {
    return res.json(req.category);
};

exports.update = (req, res) => {
    const category = req.category;
    category.name = req.body.name;
    category.save()
        .then(updatedCategory => {
            res.json(updatedCategory);
        })
        .catch(err => {
            res.status(400).json({
                error: errorHandler(err)
            });
        });
};

exports.remove = (req, res) => {
    const category = req.category;
    console.log("Removing category:", category); // Add this line to log the category object before removal
    category.deleteOne() // Use deleteOne method to delete the document
        .then(() => {
            res.json({
                message: 'Category deleted'
            });
        })
        .catch(err => {
            console.error("Error deleting category:", err); // Add this line to log the error
            res.status(400).json({
                error: errorHandler(err)
            });
        });
};



exports.list = (req, res) => {
    Category.find()
        .then(categories => {
            res.json(categories);
        })
        .catch(err => {
            return res.status(400).json({
                error: errorHandler(err)
            });
        });
};
