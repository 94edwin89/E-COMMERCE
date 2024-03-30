const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.productById = (req, res, next) => {
  const productId = req.params.productId; // updated mongoose queries, as no longer accepted callback funtion

  Product.findById(productId)
  .populate('category')
    .then((product) => {
      if (!product) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      req.product = product;
      next();
    })
    .catch((err) => {
      console.error("Error fetching product by ID:", err);
      return res.status(500).json({
        error: "Internal server error",
      });
    });
};

exports.read = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.create = (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  // Wrap the form parsing in a promise
  const parseForm = () => {
    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Error parsing form data:", err);
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
      const { name, description, price, category, quantity, shipping } = fields;

      if (
        !name ||
        !description ||
        !price ||
        !category ||
        !quantity ||
        !shipping
      ) {
        return res.status(400).json({
          error: "All files are required",
        });
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
    .then((result) => {
      console.log("Product saved successfully");
      res.json(result);
    })
    .catch((err) => {
      console.error("Error saving product:", err);
      return res.status(400).json({
        error: "Error saving product",
        details: errorHandler(err),
      });
    });
};

exports.remove = (req, res) => {
  let product = req.product;

  product
    .deleteOne()
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Product not found",
        });
      }
      res.json({
        deletedProduct: result,
        message: "Product deleted successfully",
      });
    })
    .catch((err) => {
      console.error("Error deleting product:", err);
      return res.status(400).json({
        error: errorHandler(err),
      });
    });
};

exports.update = (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  // Wrap the form parsing in a promise
  const parseForm = () => {
    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Error parsing form data:", err);
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });
  };

  parseForm()
    .then(({ fields, files }) => {
      let product = req.product;
      product = _.extend(product, fields);

      // check for all fields
      const { name, description, price, category, quantity, shipping } = fields;

      if (
        !name ||
        !description ||
        !price ||
        !category ||
        !quantity ||
        !shipping
      ) {
        return res.status(400).json({
          error: "All files are required",
        });
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
    .then((result) => {
      console.log("Product saved successfully");
      res.json(result);
    })
    .catch((err) => {
      console.error("Error saving product:", err);
      return res.status(400).json({
        error: "Error saving product",
        details: errorHandler(err),
      });
    });
};

/*
sell/ arrival
by sell=/products?sortBy=sold&order=desc&limit=4
by arrival=/products?sortBy=createdAt&order=desc&limit=4

if no params are sent , then all products are returned
*/

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Products not found",
      });
    });
};

/*
it will find the products based on the req product category
other products tha has the same category, will be returned
*/

exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .populate("category", "_id name")
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Products not found",
      });
    });
};

// exports.listCategories = async (req, res) => {
// try {
//     const result = await Product.aggregate([
//         {
//             $sortByCount: "$category"
//         },
//         {
//             $project: {
//                 _id: 0,
//                 category: "$_id"
//             }
//         }
//     ]).exec();

//     const categories = result.map(item => item.category);
//     console.log("Categories fetched successfully:", categories);
//     res.json(categories);
// } catch (err) {
//     console.error("Error fetching categories:", err);
//     return res.status(500).json({
//         error: "Internal server error",
//         message: err.message
//     });
// }
// };

exports.listCategories = (req, res) => {
  Product.distinct("category", {})
    .then((categories) => {
      if (categories.length === 0) {
        return res.status(404).json({
          error: "Categories not found",
        });
      }
      res.json(categories);
    })
    .catch((err) => {
      console.error("Error fetching categories:", err);
      res.status(500).json({
        error: "Internal server error",
        message: err.message,
      });
    });
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than

        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)

    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .then((data) => {
      if (!data) {
        return res.status(400).json({
          error: "Products not found",
        });
      }

      res.json({
        size: data.length,
        data,
      });
    })
    .catch((err) => {
      // Handle errors form the promise
      console.error(err);
      return res.status(500).json({
        error: "Internal server error",
      });
    });
};

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }

  next();
};



exports.listSearch = async (req, res) => {
  try {
    // create query object to hold search value and category value
    const query = {};

    // assign search value to query name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };

      // assign category value to query.category
      if (req.query.category && req.query.category != "All") {
        query.category = req.query.category;
      }

      // find the product based on query object with 2 properties
      // search and category
      const products = await Product.find(query).select("-photo");

      res.json(products);
    }
  } catch (error) {
    return res.status(400).json({
      error: errorHandler(error),
    });
  }
};


// exports.listSearch = (req, res) => {
//   // create query object to hold search value and category value

//   const query = {};
//   // assign search value to query name

//   if (req.query.search) {
//     query.name = { $regex: req.query.search, $options: "i" };

//     // assigne category value to query.category

//     if (req.query.category && req.query.category != "All") {
//       query.category = req.query.category;
//     }

//     //finth the product based on query object with 2 properties
//     // search and category

//     Product.find(query, (err, products) => {
//       if (err) {
//         return res.status(400).json({
//           error: errorHandler(err),
//         });
//       }
//       res.json(products);
//     }).select("-photo");
//   }
// };


exports.decreaseQuantity = (req, res, next) => {
  let bulkOps = req.body.order.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  Product.bulkWrite(bulkOps, {}, (error, products) => {
    if (error) {
      return res.status(400).json({
        error: "Could not update product",
      });
    }
    next();
  });
};