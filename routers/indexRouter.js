const { getIndex } = require("../controllers/indexController");
const express = require('express');
const indexRouter = express();

indexRouter.get("/", (req, res, next) => {
    getIndex(req, res, next);
});

module.exports = indexRouter;
