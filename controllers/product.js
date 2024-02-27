const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Product = require('../models/product');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Error parsing form data:', err);
            return res.status(400).json({
                error: 'Error parsing form data. Please try again.',
                uploadError: 'Image could not be uploaded',
                details: err.message
            });
        }

        let product = new Product(fields);

        if (files.photo) {
            console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1mb in size",
                });
            }
            
            // Use the correct property name to access the file path
            console.log("File path:", files.photo.filepath);

            product.photo.data = fs.readFileSync(files.photo.filepath);
            product.photo.contentType = files.photo.mimetype;
        }

        product.save()
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
    });
};
