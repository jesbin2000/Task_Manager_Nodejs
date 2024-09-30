const jwt = require('jsonwebtoken');
require('dotenv').config();
const data_task = require('../services/data_services');

// Basic authentication middleware
const authenticateToken = async (req, res, next) => {
    const cookies =  req.headers.cookie;

    if (!cookies) {
        return res.status(401).redirect('/');
    }
    const token = cookies.split(';').find(cookie => cookie.startsWith('token='))?.split('=')[1];
    
        if (!token) {
        return res.status(401).send({ message: 'Access Denied. No Token Provided' });
        }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await data_task.findUser(decoded.id)

        req.user = user;   
        console.log('user data' , req.user);
             
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.clearCookie('token');
        return res.status(403).redirect('/');
    }
};
// Middleware for manager role check
const requireManagerRole = (req, res, next) => {

    if (req.user && req.user.role === 'manager') {
        next();
    } else {
        res.status(403).render('error', { message: 'Access denied. Manager role required.' });
    }
};

// Middleware for user role check
const requireUserRole = (req, res, next) => {
        console.log('auth data' , req.user);
        console.log('auth data role' , typeof(req.user.role));
        
    if ( req.user.role !== 'teamMember') {
        res.status(403).json({ message: 'Access denied. User role required.' });
    }
    next();
};
module.exports = { authenticateToken, requireManagerRole, requireUserRole };
