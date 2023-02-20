const express = require("express");

const todoRoutes = require("./routes/todo.routes");
const mongodb = require("./mongodb/mongodb.connect");

mongodb.connect();

const app = express();

app.use(express.json());

app.use("/todos", todoRoutes);

// catching the error sent from the controllers
// error handling middleware
app.use((error, req, res, next) => {
    // console.log(error);
    res.status(500).json({message: error.message});
});

app.get("/", (req, res) => {
    res.json("Hello world!");
});

module.exports = app;