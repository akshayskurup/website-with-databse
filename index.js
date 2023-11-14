const express = require("express");
const app = express();
const connectDB = require('./model/database')
const session = require('express-session');
const router = require('./controller/router')
const nocache = require('nocache')


app.use(express.static('views'));

//middleware
app.use(nocache())
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret:"akshay",
    resave:false,
    saveUninitialized:true
}))
app.use(router)





//connecting to db
connectDB()


app.set('view engine','ejs');
app.set('views','./views');
app.set('controller','./controller')








app.listen(3000,()=>console.log("server running"));

