const express = require("express");

const { getIndex } = require("./controllers/indexController");

const app = express();

// Use ejs as view engine
app.set("view engine", "ejs");

app.get("/", (req, res, next) => {
    getIndex(req, res, next);
});

app.listen(3000, () => {
    console.log("listening port 3000");
});
