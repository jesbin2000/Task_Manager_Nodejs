const Task = require('../model/Tasks')
const data_task = require('../services/data_services');
const helpers = require('../Helpers/dateHelpers');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');




//-------------------LogIn Page View ---------------------

const loginView = (req, res) => {

    const locals = {
        logoutBtn : false,
        roleTo : "User"
    }

    res.render('main_index/signin', { locals, message:null});
}


//-------------------------Sign In ---------------------

const signin = async (req, res) => {
    try {
        locals ={
            roleTo: "User",
        }
        const {username, password} = req.body;
        
        if (!password || !username) {
            return res.status(400).render('main_index/signin', { message: 'Enter the Password & username' ,locals});
        }        
        
        let validUser = await data_task.validUser(username, password);  
        if (!validUser) {
            return res.status(404).render('main_index/signin', { message: 'Invalid Username' ,locals});
        }

        const passwordValid = await bcrypt.compare(password, validUser.password);
        
        if (!passwordValid) {
            return res.status(401).render('main_index/signin', { message: 'Password incorrect' ,locals });
        }

        if (validUser.role === "manager") {
            const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
            res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 }).redirect('/dashboard');
        } else {
            return res.status(404).render('main_index/signin', { message: 'Invalid Username' , locals});
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error'); 
    }
}



//-----------------Add Task view Page -----------------------

const addTaskView = async (req, res) =>{

    try {

        const teamMembers = await data_task.findTeamMembers();
        res.render('main_Index/add_task', {teamMembers, message :null, edit:false ,task:{} })
        
    } catch (error) {
        console.log(error);
        
    }

}

//------------- view dashboard ----------

const dashboard = async (req, res) =>{
    const locals = {
        logoutBtn : true
        }


        const page = parseInt(req.query.page) || 1;  
        const limit = parseInt(req.query.limit) || 4; 
        const paginationNeeds = await data_task.getPaginatedTasks(page,limit);
        
        let totalPages = paginationNeeds.totalPages;
        let currentPage = paginationNeeds.currentPage;
        let tasks = paginationNeeds.transformedTasks;
        let unassignedUsers = await  data_task.findUnassignedUsers();

        let allTask = await data_task.allTasks();
        
        res.render('main_Index/dash_board', {  tasks, message : null, currentPage , totalPages, limit,allTask, unassignedUsers,locals} );

    
}


//-------------------- Create Task -------------- 

const createTask = async (req, res) => {    
    
        const edit = false;

    try {
        const { task, description, date, assigned } = req.body;

        if (!task || !assigned || !date || !description) {
            const teamMembers = await data_task.findTeamMembers();
            return res.render('main_Index/add_task', { teamMembers, message: 'Enter all informations', edit, task:{}});
        } 
    
        const newTask = new Task({
            task: task,
            description: description,
            assigned: assigned,
            dueDate: date
        });
    
        await newTask.save();
        return res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }   
};




//------------------ Search Task ---------------------

const searchTask = async (req , res) => {
    try {
        
        const {searchTask} = req.body;
    
        const page = parseInt(req.query.page) || 1;  
        const limit = parseInt(req.query.limit) || 4; 
        
        const paginationNeeds = await data_task.getPaginatedTasks(page,limit);
        // console.log(paginationNeeds);
        
        let totalPages = paginationNeeds.totalPages;
        let currentPage = paginationNeeds.currentPage;
        let transformedTasks =[];
        transformedTasks = paginationNeeds.transformedTasks;
        let unassignedUsers = await data_task.findUnassignedUsers();
        unassignedUsers = unassignedUsers || [];
    
        let allTask = await data_task.allTasks();
    
    
        if(!searchTask){
            res.redirect('/dashboard')
        }
        else {
    
            const tasks = await data_task.searchData(searchTask);
    
            if (tasks.length == 0) {
                res.render('main_Index/dash_board', {message: ` " ${searchTask} " Not Found `,  tasks, currentPage, totalPages, limit, allTask, unassignedUsers } )
                
            } else {
                
                res.render('main_Index/dash_board', {  tasks, message:null, currentPage, totalPages, limit, allTask, unassignedUsers} )
            }
            
        }
    } 
    catch (error) {

        console.log(error);
        
    }

}



//----------------View single Task ---------------------------

const ParticularTaskView = async(req, res) =>{
    try {
        const taskId = req.params.id;
    
        const task = await data_task.taskView(taskId);
    
        task.remainingDays  =  helpers.remainingDays(task.dueDate)
    
        task.formattedDueDate = helpers.formatDate(new Date(task.dueDate));
    
        res.render('otherTasks/particularTask',{task})
    } catch (error) {

        console.log(error);

    }
}

//------------------DELETE TASK --------------------------------

const deleteTask = async (req, res) => {
    try {        
        const check=await data_task.taskDeleteion(req.params.id);
        console.log(check);
        
        if(check){
            res.status(200).json({message:"Success",status:true}); 
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error"); 
    }
}

const about = ( req, res ) =>{
    const locals = {
        logoutBtn : true
        }
    res.render('main_Index/about', locals);
}


// --------------------EDIT TASK VIEW-----------------------------

const editTaskView = async ( req, res ) =>{
    try{
        const edit = true;
        id = req.params.id;
        const task = await data_task.findTask(id);
        
        
        console.log(task);

        task.formattedDate = await helpers.dateformating(task.dueDate)
        
        const teamMembers = await data_task.findTeamMembers();
        res.render('main_Index/add_task', {task, edit, message:null, teamMembers})

    }catch(error){
        res.status(404).json("TASK not found");
    }

}



const editTask = async (req, res) =>{

    try {
        const id = req.params.id;
        const task = req.body
    
        const updateTask  = await data_task.updateTask(task, id);
        if (updateTask === true) {
            res.redirect('/dashboard')
        }
    } catch (error) {
        console.log(error);
    }
}

const backToHome = async (req, res) =>{
    try{
        const user = await data_task.findUser(req.user._id);
        if (user.role === "manager") {
            res.redirect('/dashboard')
        } else {
            res.redirect('/userDashboard')
        }
        
    }
    catch(error){
        console.log(error);
    }

} 



const logout = (req, res) =>{

        res.clearCookie('token')
        res.redirect('/')
    
    }


module.exports = { loginView, signin, dashboard, addTaskView,
                    createTask,searchTask, about, ParticularTaskView,
                    deleteTask,editTaskView, editTask,logout,backToHome
                }
