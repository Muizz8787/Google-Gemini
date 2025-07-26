const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Doodle-Gemini");

//check db connection 

connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Databse not connected");
})

//create schema

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
        },
    email: {
        type: String,
        required: true
        },
    password:{
        type: String,
        required: true
    }
});

const collection = mongoose.model("user", userSchema);

module.exports = collection;
