const express=require('express')
const router=express.Router()

const{requireSignin,isAuth, isAdmin}=require('../controllers/auth')
const{userById,read,update,purchaseHistory}=require('../controllers/user')



// route use to sign in by admin

router.get('/secret/:userId',requireSignin,isAuth,isAdmin,(req,res)=>{
    res.json({
        user:req.profile
    })
});

// route for read users from db hit

router.get('/user/:userId',requireSignin,isAuth,read)

//  route for update user details

router.put('/user/:userId',requireSignin,isAuth,update)
router.get('/orders/by/user/:userId',requireSignin,isAuth,purchaseHistory)

router.param('userId',userById)


module.exports=router;
