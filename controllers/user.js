const User=require('../models/user')

exports.userById = (req, res, next, id) => {
    User.findById(id)
        .then(user => {
            if (!user) {
                return res.status(400).json({
                    error: 'User not found'
                });
            }
            req.profile = user;
            next();
        })
        .catch(err => {
            console.error('Error fetching user by ID:', err);
            return res.status(500).json({
                error: 'Internal server error'
            });
        });
};


exports.read= (req,res)=>{
    req.profile.hashed_password=undefined
    req.profile.salt= undefined

    return res.json(req.profile)
}

exports.update = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.profile._id },
            { $set: req.body },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({
                error: 'You are not authorized to perform this action'
            });
        }

       if (user.profile) {
            user.profile.hashed_password = undefined;
            user.profile.salt = undefined;
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};

exports.addOrderToUserHistory = (req, res, next) => {
    let history = [];

    req.body.order.products.forEach(item => {
        history.push({
            _id: item._id,
            name: item.name,
            description: item.description,
            category: item.category,
            quantity: item.count,
            transaction_id: req.body.order.transaction_id,
            amount: req.body.order.amount
        });
    });

    User.findOneAndUpdate(
        { _id: req.profile._id },
        { $push: { history: history } },
        { new: true },
        (error, data) => {
            if (error) {
                return res.status(400).json({
                    error: "Could not update user purchase history"
                });
            }
            next();
        }
    );
};
