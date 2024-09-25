const express = require('express');
const router = express.Router();
const managerController  = require('../controller/manager_controller')
const middleware = require('../middleware/authMiddleware')

// ---------- GET METHODE ---------------------

router.get('/manager', managerController.loginView);

router.get('/dashboard', middleware.authenticateToken , middleware.requireManagerRole, managerController.dashboard);

router.get('/addTask',middleware.authenticateToken , middleware.requireManagerRole,managerController.addTaskView);

router.get('/about', managerController.about)

router.get('/viewTask/:id' , managerController.ParticularTaskView)

router.get('/edit/:id' , managerController.editTaskView)

router.get('/logout', managerController.logout);

router.get('/Home', middleware.authenticateToken, managerController.backToHome);

//------------------EDIT & DELETE ----------------

router.post('/edit/:id' , middleware.authenticateToken , middleware.requireManagerRole, managerController.editTask)

router.delete('/delete/:id' , middleware.authenticateToken , middleware.requireManagerRole, managerController.deleteTask)

// ---------------- POST METHODE -----------------

router.post('/managerDashboard',  managerController.signin)

// router.post('/signUp', managerController.signUp);

router.post('/addTask', middleware.authenticateToken , middleware.requireManagerRole, managerController.createTask);

router.post('/search',middleware.authenticateToken , middleware.requireManagerRole, managerController.searchTask);





module.exports = router;