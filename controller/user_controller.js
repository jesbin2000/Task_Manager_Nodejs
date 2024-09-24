const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');
const data_task = require('../services/data_task');
const helpers = require('../Helpers/dateHelpers');
const Task = require('../model/Tasks')


//----------------- Sign Up page View--------------------

const signupView = (req, res) => {
    res.render('main_index/sign_up', { message: null });
}


// <<-------------------- SIGN UP ------------------------------>>

const signUp = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!password || !username) {
            return res.status(400).render('main_index/sign_up', { message: 'Enter the Password & username' });
        }
        data_task.signUpTask(username, password);
        res.status(201).redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Server error' });
    }
};

// <<----------------SIGNIN IN LAYOUT ---------------------------->>

const loginView = (req, res ) =>{
    const locals = {
        logoutBtn : false,
        roleTo : "Manager"
    }
    res.render('main_index/signin', { locals, message:null})
}



// <<------------------------- SIGN IN ------------------------------->>

const signin = async (req, res) => {
    try {
        const {username, password} = req.body;
        
        if (!password || !username) {
            return res.status(400).render('main_index/signin', { message: 'Enter the Password & username' });
        }        
        
        let validUser = await data_task.validUser(username, password);  
        if (!validUser) {
            return res.status(404).render('main_index/signin', { message: 'Invalid Username' });
        }

        const passwordValid = await bcrypt.compare(password, validUser.password);
        
        if (!passwordValid) {
            return res.status(401).render('main_index/signin', { message: 'Password incorrect' });
        }

        if (validUser.role === "teamMember") {
            const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
            res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 }).redirect('/userDashboard');
        } else {
            return res.status(404).render('main_index/signin', { message: 'Invalid Username' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error'); 
    }
}




const dashBoard = async(req, res) =>{

    
    locals ={
        logoutBtn : true,
    }

    const cookies = req.headers.cookie; 

    if (!cookies) {
        return res.status(401).render('main_index/signin', { message: 'No cookies found. Please log in.' });
    }

    const token = cookies.split(';').find(cookie => cookie.startsWith('token='))?.split('=')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const assignedTask = await data_task.assignedTask(decoded.id);

    res.render('main_index/user_dashboard', {locals, assignedTask});
} 

const statusUpdate = async(req, res) =>{

        const { taskId, status } = req.body;
        try {
            await Task.findByIdAndUpdate(taskId, { status: status });
            res.redirect('/userDashboard');
        } catch (error) {
            console.error('Error updating task status:', error);
            res.status(500).send('Error updating task status');
        }
}






const logout = (req, res) =>{

    res.clearCookie('token')
    res.redirect('/')

}





    module.exports = { loginView, signUp, signupView, signin, dashBoard,
                        logout, statusUpdate
                    }

