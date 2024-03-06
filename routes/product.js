const express=require('express');
const router=express.Router();


const{create,productById,read,remove,update,list,listRelated,listCategories,listBySearch,photo}=require('../controllers/product');
const{requireSignin,isAuth, isAdmin}=require('../controllers/auth');
const{userById}=require('../controllers/user');

router.get('/product/:productId',read);
router.post('/product/create/:userId',requireSignin,isAdmin,isAuth,create) ;

router.delete('/product/:productId/:userId',requireSignin,isAdmin,isAuth,remove);
router.put('/product/:productId/:userId',requireSignin,isAdmin,isAuth,update);

// route use to display all the product lists
router.get('/products',list);

// route use to display most sold or releted products
router.get('/products/related/:productId',listRelated);

// route for category list in products
router.get('/products/categories',listCategories); 

router.post('/products/by/search',listBySearch);

// route for photo upload
router.get('/product/photo/:productId',photo)

router.param('userId',userById);
router.param('productId',productById);

module.exports=router;
