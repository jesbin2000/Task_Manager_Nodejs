const express = require('express');
const connectDB = require('./controller/config/db');
const app = express();
const mangerRoutes = require('./routes/manager_routes');
const userRoutes = require('./routes/user_routes');

const path = require('path');
require('dotenv').config();

// connect database connect
connectDB();



// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', mangerRoutes);
app.use('/', userRoutes);

//Template engine   
app.set('view engine', 'ejs' );


// PORT RUNNING\
const PORT = process.env.PORT || 5000 ;
app.listen(PORT,()=>{
    console.log(`Server running on port : ${PORT}`);
});