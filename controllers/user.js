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
