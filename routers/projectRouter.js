const { getIndex,postAskProject, postFetchPartial, getProject } = require("../controllers/projectController");
const express = require('express');
const projectRouter = express();

projectRouter.get("/", (req, res, next) => {
    getIndex(req, res, next);
});

projectRouter.post("/ask", (req, res, next) => {
    postAskProject(req, res, next);
});

projectRouter.post("/fetch-partial", (req, res, next) => {
    postFetchPartial(req, res, next);
});

projectRouter.get("/:id", (req, res, next) => {
    getProject(req, res, next);
});

module.exports = projectRouter;
