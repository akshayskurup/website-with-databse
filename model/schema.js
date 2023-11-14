const mongoose = require('mongoose');
//set upping schema
const userSchema=new mongoose.Schema({
    name:String,
    email:{
      type:String,
      unique:true,
      required:true
    },
    password:String
  });
  
  const User = mongoose.model('User',userSchema);
  
  
  
  
  
  module.exports=User;