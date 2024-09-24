const express = require('express');
const router = express.Router();  
const userController = require('../controller/user_controller');


// <<------------------ GET -------------------------->>

router.get('/', userController.loginView);

router.get('/signUp', userController.signupView);

router.get('/userDashboard', userController.dashBoard);

router.post('/update-task-status', userController.statusUpdate);


// <<----------------- POST  --------------------->>

router.post('/signup', userController.signUp )

router.post('/userDashboard',  userController.signin)








module.exports = router;
