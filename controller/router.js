const express = require("express");
const router = express.Router();
const User = require("../model/schema");
const bcrypt = require('bcrypt')
var AdminLogin
var UserLogin
var username

const credential = {
  email: "admin@gmail.com",
  password: "akshay9744",
};

//home route
router.get("/",(req, res) => {
  if(req.session.UserLogin){
    res.redirect("/homePage")
  }
  else{
    res.render("home",{message:'', signupMessage:""});
  }
  
});

//database
router.post("/signup", async(req, res) => {
  const { name, email, password } = req.body;

  if (/^[A-Za-z ]+$/.test(name)) {//checking for only character 
      // Check if a user with the same email already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // Handle the case where the email already exists
        return res.render('home', { message: '', signupMessage: 'Email already exists' });
      }





    const saltround = 10;
    const hashedPassword = await bcrypt.hash(password,saltround)

    const newUser = new User({
      name,
      email,
      password:hashedPassword,
    });
    await newUser
      .save()
      .then(() =>{
        req.session.UserLogin=true;
        req.session.username = name
        if(req.session.UserLogin){
          res.render("homePage",{ user: name })
        }
        else{
          res.redirect('/')
        }
        
        
      })
      .catch((err) => 
      console.error('Error during signup:', err)
      )} 
      else {
    res.render('home',{message:"",signupMessage:"Invalid username!Only characters are allowed"});
  }
});

//login route

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  // If the user doesn't exist
  if (!user) {
      return res.render("home", { message: "No user with that email address found", signupMessage: "" });
  }

  const passwordMatch= await bcrypt.compare(password,user.password)


  // If the password is incorrect
  if (!passwordMatch) {
      return res.render("home", { message: "Incorrect password", signupMessage: "" });
  }

  console.log(`Password provided: ${password}`);
console.log(`Hashed password in the database: ${user.password}`);
console.log(`Password matches: ${passwordMatch}`);


  // If both email and password are correct
  req.session.UserLogin = true;
  req.session.username = user.name;

  if (req.session.UserLogin) {
      console.log(req.session.UserLogin)
      return res.redirect("/homePage"); 
  } else {
      return res.redirect('/');
  }
});


router.get('/homePage',(req,res)=>{
  
  if(req.session.UserLogin){
  const username = req.session.username;
    res.render("homePage",{user:username});
  }
  else{
    res.redirect('/')
  }
})


router.post('/login/logout',(req,res)=>{
  req.session.UserLogin = false;
  req.session.UserLogin=false
    console.log(" User Logout successfully")
    res.redirect('/')
  })


//Admin route
router.get("/admin", (req, res) => {
  if(req.session.AdminLogin==true){
  res.redirect("/adminPanel");
  }
  else{
    res.render('admin',{message:""})
  }
});
router.post("/adminPanel" ,(req, res) => {
  
    if (req.body.email != credential.email) {
      res.render('admin',{message:"Invalid Email"})
    } else if (req.body.password != credential.password) {
      res.render('admin',{message:"Invalid Password"})
    } else {
      req.session.AdminLogin=true
      res.redirect('/adminPanel');
    }
});
  
router.get('/adminPanel',async(req,res)=>{
  try{
    const users = await User.find();
    if(req.session.AdminLogin){
      res.render('adminPanel',{users,message:""})
    }
    else{
      res.redirect('/');
    }
  }
  catch(err){
    res.status(500).send("Server Error")
  }
})


//inserting data from adminPanel
router.post('/insert',async (req,res)=>{
  const saltround=10
  const {name,email,password}=req.body
  const users = await User.find();
  const hashedPassword = await bcrypt.hash(password,saltround)
  const newUser = new User({
    name,
    email,
    password:hashedPassword,
  })
  newUser.save()
  .then(()=>{
    res.redirect('/adminPanel');
  })
  .catch((err)=>{
    console.error(err);
        res.render('adminPanel',{users,message:"Email already exists"})
  })
})


//editing the data from adminPanel
router.get('/adminPanel/edit/:id', async (req, res) => {
  const users = await User.findById(req.params.id);
  if(req.session.AdminLogin){
    res.render('editForm', { users: users,errorMessage:"" });
  }
  else{
    res.redirect('/admin');
  }
  
  
});

// updating data from the adminPanel
router.post('/adminPanel/update/:id', async (req, res) => {
  try {
    if (req.body.password) {
      const saltround = 10;
      const hashedPassword = await bcrypt.hash(req.body.password, saltround);
      req.body.password = hashedPassword;
    }
      await User.findByIdAndUpdate(req.params.id, req.body);
      console.log("Update successful");
      // Check if the user is logged in as admin
      if (req.session.AdminLogin) {
          res.redirect('/adminPanel');
      } else {
          res.redirect('/admin');
      }

  } catch (err) {
      if (err.code === 11000) {
          // Duplicate key error (This means the email already exists)
          res.render('editForm', {
              errorMessage: 'Email already exists!',
              users: req.body
          });
      } else {
          // Handle other errors here
          res.status(500).send('Internal Server Error');
          console.error("Error during update:", err);
      }
  }
});


//deleting data
router.post('/adminPanel/delete/:id',async (req,res)=>{
  try{
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/adminPanel');
  }
  catch(err){
        console.error("Error deleting user:", err);
        res.status(500).send('Internal Server Error');
  }
})

//search bar
router.get('/adminPanel/search', async (req, res) => {
  const {fullname} = req.query;
  try {
    const users = await User.find({
        name: new RegExp("^"+fullname, 'i')
    });

    if(req.session.AdminLogin){
      if(users.length>0){
        res.render('adminPanel',{users,message:""});
      }
      else{
        res.render('adminPanel',{users,message:"no user found"})
      }
    }
    else{
      res.redirect('/admin');
    }
    
    
} catch (err) {
    console.error("Error during search:", err);
    res.status(500).send('Internal Server Error');
}
});

//logout button 
router.post('/adminPanel/logout',(req,res)=>{
  req.session.AdminLogin=false
    console.log("Logout successfully")
    // Redirect to the home page after logout
     
      res.redirect('/admin');  
})

module.exports = router;
