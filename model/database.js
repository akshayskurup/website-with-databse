const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/siggnup", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // Terminate the Node.js process with a failure code
    process.exit(1);
  }
};





module.exports = connectDB;
