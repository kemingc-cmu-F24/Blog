const Blog = require('../models/blog');
const Project = require('../models/project');

const getIndex = async (req, res, next) => {
    const recentBlogs = await Blog.find().sort({createdAt: -1}).limit(12).exec();
    const recentProjects = await Project.find().sort({createdAt: -1}).limit(3).exec();
    return res.render("index", {
        path: "/",
        recentBlogs: recentBlogs,
        recentProjects: recentProjects,
    });
};

module.exports = {getIndex}
