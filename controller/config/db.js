const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected sucessfully');
        
}catch(error){
    console.log(error);    
}}

module.exports = connectDB;