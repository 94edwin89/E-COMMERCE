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



exports.update=(req,res)=>{

    const category=req.category
    category.name=req.body.name
    category.save((err,data)=>{
        if(err){
            return res.json(400).json({
                error:errorHandler(err)
            })

        }

        res.json(data)
    })

}



exports.remove=(req,res)=>{
    
    const category=req.category
    
    category.remove((err,data)=>{
        if(err){
            return res.json(400).json({
                error:errorHandler(err)
            })

        }

        res.json({
            message:'Category deleted';
        })
    })
}



exports.list=(req,res)=>{
    
    Category.find().exec((err,data)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }

        res.json(data);
    })
}