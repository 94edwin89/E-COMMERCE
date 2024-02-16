const User=require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const {errorHandler}=require('../helpers/dbErrorHandler');

exports.signup=async (req,res) =>{
    console.log("req.body",req.body)

    try {
        const user = new User(req.body);
        await user.save();
        user.salt=undefined;
        user.hashed_password=undefined;
        res.json({
            user
        });
    } catch (err) {
        res.status(400).json({
            error: errorHandler(err)// Assuming you want to send the error message to the client
        });
    }
};

exports.signin = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(400).json({
                    error: "User with that email does not exist. Please sign up."
                });
            }
            if (!user.authenticate(password)) {
                return res.status(401).json({
                    error: 'Email and password do not match.'
                });
            }

            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

            res.cookie('t', token, { expire: new Date() + 9999 });

            const { _id, name, email, role } = user;
            return res.json({ token, user: { _id, email, name, role } });
        })
        .catch(err => {
            console.error("Error in signin:", err);
            return res.status(500).json({ error: "Internal server error." });
        });
};


exports.signout=(req,res)=>{
    res.clearCookie('t');
    res.json({message:'Signout success'});
}




exports.requireSignin=expressJwt({
    secret:process.env.JWT_SECRET,
    userProperty:"auth",
    algorithms:["HS256"] ,   
})


exports.isAuth=(req,res,next)=>{
    let user=req.profile &&req.auth && req.profile._id==req.auth._id;

    if(!user){
        return res.status(403).json({
            error:'Access denied'
        })
    }
    next();
}


exports.isAdmin=(req,res,next)=>{
    if(req.profile.role===0){
        return res.status(403).json({
            error:"Admin resourse! Access denied"
        })
    }
    next();
}
