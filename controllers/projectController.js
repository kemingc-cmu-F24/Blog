const Project = require("../models/project");
const { askProject } = require("../utils/chatgpt");
var showdown = require("showdown");

const getProject = async (req, res, next) => {
    const id = req.params.id;

    const project = await Project.findById(id).exec();
    const nextProject = await Project.find({ _id: { $gt: project._id } }).sort({_id: 1 }).limit(1).exec();
    const prevProject = await Project.find({ _id: { $lt: project._id } }).sort({_id: -1 }).limit(1).exec();
    console.log(nextProject);
    // const relatedBlogs = await getRelatedBlogs(blog);
    (converter = new showdown.Converter()),
        (project.content = converter
            .makeHtml(
                project.content.replaceAll(
                    "${this}",
                    `/data/projects/${project._id}`
                )
            )
            .replace("<code>", "<code class='prettyprint'>"));
    return res.render("project", {
        path: "/project",
        project: project,
        nextProject: nextProject,
        prevProject: prevProject,
        // relatedBlogs: relatedBlogs,
    });
};
const postFetchPartial = async (req, res, next) => {
    const PROJECTS_PER_PAGE = 6;
    // console.log(req.body);

    const techs = req.body.techs;

    const filter = {
        $expr: {
            $setIsSubset: [techs, "$techs"],
        },
    };

    const totalDocuments = await Project.countDocuments(filter);
    const maxPage = Math.ceil(totalDocuments / PROJECTS_PER_PAGE);

    let page = 1;

    if (req.body["page"]) {
        page = req.body.page;
        page = Math.min(page, maxPage);
        page = Math.max(page, 1);
    }
    const pageStart = Math.max(page - 2, 1);
    const pageEnd = Math.min(maxPage, page + 2);

    const pageList = Array(pageEnd - pageStart + 1)
        .fill(1)
        .map((v, i) => pageStart + i);

    const projects = await Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(PROJECTS_PER_PAGE * (page - 1))
        .limit(PROJECTS_PER_PAGE)
        .exec();

    return res.render("partial/project-list-partial", {
        projects: projects,
        page: page,
        pageList: pageList,
        maxPage: maxPage,
    });
};
const getIndex = async (req, res, next) => {
    const PROJECTS_PER_PAGE = 5;

    const techList = await Project.find({}, "techs").distinct("techs").exec();

    // const DEFAULT_CATEGORY = "All";

    // categoryList.unshift(DEFAULT_CATEGORY);

    let techsParam = req.query.techs;

    if (!techsParam) {
        techsParam = [];
    }
    else{
        techsParam = req.query.techs.split(",");
    }

    const filter = {
        $expr: {
            $setIsSubset: [techsParam, "$techs"],
        },
    };
    // if (category) filter = { category: category };
    // else category = DEFAULT_CATEGORY;

    const totalDocuments = await Project.countDocuments(filter);

    const maxPage = Math.ceil(totalDocuments / PROJECTS_PER_PAGE);

    let page = 1;

    if (req.query["page"]) {
        page = req.query.page;
        page = Math.min(page, maxPage);
        page = Math.max(page, 1);
    }

    const pageStart = Math.max(page - 2, 1);
    const pageEnd = Math.min(maxPage, page + 2);

    const pageList = Array(pageEnd - pageStart + 1)
        .fill(1)
        .map((v, i) => pageStart + i);

    const projects = await Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(PROJECTS_PER_PAGE * (page - 1))
        .limit(PROJECTS_PER_PAGE)
        .exec();

    return res.render("project-list", {
        path: "/project",
        projects: projects,
        page: page,
        pageList: pageList,
        maxPage: maxPage,
        techs: techsParam,
        techList: techList,
    });
};

const postAskProject = async (req, res, next) => {
    await askProject(
        req.body.msg,
        (text) => {
            res.write(text);
        },
        () => res.end()
    );
};

module.exports = { getIndex, postFetchPartial, postAskProject, getProject };
