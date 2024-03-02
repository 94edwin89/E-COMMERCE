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
                error: "category does not exist!!"
            });
        });
};



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


exports.read=(req,res)=>{
    return res.json(req.category)
}