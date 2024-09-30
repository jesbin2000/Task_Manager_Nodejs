const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const taskSchema = new Schema({
    task: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    assigned : {
        type: Schema.Types.ObjectId, 
        required: true,
        ref: 'User' 
    },
    status: {
        type: String,
        default: "Pending"
    }
}, { timestamps: true });


// ------------Create Model for exporting ----------
const Task = mongoose.model('Task', taskSchema); 
module.exports = Task;
