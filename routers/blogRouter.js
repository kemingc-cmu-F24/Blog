const {
    getIndex,
    postAskBlog,
    getBlog,
    postUpdateBlog
} = require("../controllers/blogController");
const express = require("express");
const blogRouter = express();

blogRouter.post("/update", (req, res, next) => {
    postUpdateBlog(req, res, next);
});

blogRouter.post("/ask", (req, res, next) => {
    postAskBlog(req, res, next);
});

blogRouter.get("/:id", (req, res, next) => {
    getBlog(req, res, next);
});

blogRouter.get("/", (req, res, next) => {
    getIndex(req, res, next);
});

module.exports = blogRouter;
