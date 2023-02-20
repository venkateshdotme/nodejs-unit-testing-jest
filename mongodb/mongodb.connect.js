const mongoose = require("mongoose");

async function connect() {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect("mongodb://localhost:27017/todo-tdd");
    } catch (err) {
        console.error(err);
        console.error("Error connecting to mongoDB");
    }
}

module.exports = { connect };
