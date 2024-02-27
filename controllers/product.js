const formidable=require('formidable')
const _ =require('lodash')
const fs=require('fs')
const Product= require('../models/product')
const {errorHandler}=require('../helpers/dbErrorHandler');

exports.create=(req,res)=>{
    let form=new formidable.IncomingForm()
    from.keepExtensions = true
    form.parse(req,(err,fields,files)=>{
        if(err){
            return res.status(400).json({
                error:'Image could not be uploaded'
            })
        }
        let product=new Product(fields)

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
              return res.status(400).json({
                error: "Image should be less than 1mb in size",
              });
            }
            product.photo.data = fs.readFileSync(files.photo.filepath); // change path to filepath
            product.photo.contentType = files.photo.mimetype; // change typt to mimetype
          }
        product.save((err, result)=>{
            if(err){
                return  res.status(400).json({
                    error:errorHandler(error)
                })
            
            }
            res.json(result);
        })
    })
}