const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Product = require('../models/product');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    // Wrap the form parsing in a promise
    const parseForm = () => {
        return new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Error parsing form data:', err);
                    reject(err);
                } else {
                    resolve({ fields, files });
                }
            });
        });
    };

    parseForm()
        .then(({ fields, files }) => {
            let product = new Product(fields);

            // check for all fields
            const {name,description,price,category,quantity,shipping}=fields

            if (!name||!description||!price||!category||!quantity||!shipping){
                return res.status(400).json({
                    error:"All files are required"
                })
            }               


            // 1kb =1000
            // 1mb = 1000000
            if (files.photo) {
                console.log("FILES PHOTO: ", files.photo);
                if (files.photo.size > 1000000) {
                    return res.status(400).json({
                        error: "Image should be less than 1mb in size",
                    });
                }
                
                // Use the correct property name to access the file path
                console.log("File path:", files.photo.path);
            
                product.photo.data = fs.readFileSync(files.photo.path);
                product.photo.contentType = files.photo.mimetype;
            }

            return product.save();
        })
        .then(result => {
            console.log('Product saved successfully');
            res.json(result);
        })
        .catch(err => {
            console.error('Error saving product:', err);
            return res.status(400).json({
                error: 'Error saving product',
                details: errorHandler(err)
            });
        });
};
