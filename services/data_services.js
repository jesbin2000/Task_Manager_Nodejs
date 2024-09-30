const User = require('../model/User');
const Task = require('../model/Tasks');
const helpers = require('../Helpers/dateHelpers')
const bcrypt = require('bcrypt');

//------------------ Sign Up ------------------

const signUpTask = async ( username, password) =>{
    // console.log(username , password);
    
    const existingUser = await User.findOne({ userName: username });
        if (existingUser) {
            return res.status(409).render('main_index/sign_up', { message: 'User already exists' });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ userName: username, password: hashPassword });
        await newUser.save();
 }

//---------------------Sign In -------------------

const validUser = async(username, password) =>{

    const validUser = await User.findOne({userName:username});
    return validUser
}


const findUser = async (id) => {
    try {
        const user = await User.findById(id);
        
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        console.error('Error finding user:', error.message);
        throw error;
    }
};





// ----------------- ALL TASKS ----------------------------------

const allTasks = async () => {
    try {
        const allTask = await Task.find().populate({
            path: 'assigned',
            select: 'userName -_id'
        });
        const transformedTasks = allTask.map(task => {
            return {
            ...task.toObject(),
            assigned: task.assigned.userName 
            };
        });
    return transformedTasks;
} catch (error) {
        console.log(error);
        return [];
        
    }
};

// ---------------FIND TEAM MEMBERS ---------------------

const findTeamMembers = async () => {
    const teamMembers = await User.find({role :"teamMember"});
    return teamMembers;
}

//-----------------sEARCH TASK --------------------------

const searchData = async (searchTask) => {
    try {
        if (!searchTask || typeof searchTask !== 'string') {
            throw new Error("Invalid search term");
        }
        
        const searchNoSpecialChar = searchTask.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        
        const tasks = await Task.find({
            $or: [
                { task: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { description: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
            ]
        }).populate({
            path: 'assigned',
            select: 'userName -_id'
        });
        
        const transformedTasks = tasks.map(task => {
            return {
            ...task.toObject(),
            assigned: task.assigned.userName 
            };
        });

        return transformedTasks;

    } catch (error) {
        console.error("Error searching tasks:", error);
        throw error;
    }
};


// ------------------- Pagination --------------------------

const getPaginatedTasks = async(page, limit ) => {
    try {
        const skip = (page - 1) * limit;

        const tasks = await Task.find({})
            .populate({
                path: 'assigned',
                select: 'userName -_id'
            })
            .skip(skip)  
            .limit(limit);

        const transformedTasks = tasks.map(task => ({
            ...task.toObject(),
            assigned: task.assigned?.userName || 'Unassigned'
        }));

        const totalTasks = await Task.countDocuments();
        const totalPages = Math.ceil(totalTasks / limit);

        return {
            transformedTasks,
            totalTasks,
            totalPages,
            currentPage: page
        };

    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};


const taskView = async(id) => {
    try {
        const decodedtask = await Task.findById(id).populate({
            path: 'assigned',
            select: 'userName -_id'
        });
        
        const transformedTask = {
            ...decodedtask.toObject(),
            assigned: decodedtask.assigned.userName 
        };

        return transformedTask;
        
    } catch (error) {
        console.log(error);
        throw error;
    }
};


const taskDeleteion = async(id) =>{
    try{
        await Task.deleteOne({ _id: id});
        return true;
    }
    catch(error){
        console.log(error);
        return false;
    }
}



const findTask = async(id) =>{
    const task = await Task.findById({_id : id}).populate({
        path: 'assigned',
        select: 'userName -_id'
    });

    const transformedTask = {
        ...task.toObject(),
        assigned: task.assigned.userName 
    };

    return transformedTask;
    
}

async function findUnassignedUsers() {
    try {

        const unassignedOrWorkFreeUsers = await User.aggregate([
            {
                $lookup: {
                    from: "tasks",
                    localField: "_id",
                    foreignField: "assigned",
                    as: "tasks"
                }
            },
            {
                $match: {
                    $or: [
                    { tasks: { $size: 0 } },  
                    {
                        tasks: {
                        $not: { $elemMatch: { status: { $in: ["Pending", "Progress"] } } } 
                        }   
                    }
                    ]
                }
            }
        ]);
        
        return unassignedOrWorkFreeUsers;
        
        }   
        catch (err) {
        console.error(err);
        }
    }

const updateTask = async( task, id ) =>{
try {

    await Task.findByIdAndUpdate(id, {
        task: task.task,
        description: task.description,
        dueDate: task.dueDate,
        assigned: task.assigned
        },
        { new: true, runValidators: true }
    ); 
        return true;
} catch (error) {
    console.log(error);    
    return false;
}   
}

const assignedTask = async (id) => {
    let assignedTasks = await Task.find({ assigned: id });

    
    
    assignedTasks = await Promise.all(assignedTasks.map(async task => {
        task.date = await helpers.formatDate(task.dueDate);    
        task.remainingDays = await helpers.remainingDays(task.dueDate)   
        return task; 
    }));
    return assignedTasks; 
};



module.exports = { signUpTask, validUser, findTeamMembers, 
                    allTasks,searchData, getPaginatedTasks, taskView,
                    findUnassignedUsers, taskDeleteion, findTask,
                    updateTask, findUser, assignedTask }; 