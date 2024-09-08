const OpenAI = require("openai");
const fs = require("fs");
const Blog = require("../models/blog");
const Project = require("../models/project");

const { finished } = require("stream/promises");
const { Readable } = require("stream");

const openai = new OpenAI({
    organization: "org-aK31INTHatK12fFzkrmyBA7P",
    project: "proj_c9czXgbNEXJ76QhEX9mJtftz",
    apiKey: process.env.OPENAI_KEY,
});

async function generateImage(msg, savePath) {
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: msg,
        n: 1,
        size: "1024x1024",
    });
    const image_url = response.data[0].url;

    const imageResponse = await fetch(image_url);

    const fileStream = fs.createWriteStream(savePath, { flags: "wx" });

    await finished(Readable.fromWeb(imageResponse.body).pipe(fileStream));

    return savePath;
}

async function generateKeywords(msg) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "Give a plain text response, where the text includes keywords you will generate from user message, separated by comma, your keywords should all start with uppercase letter. You don't need a period at the end. The keywords you generate will be used for optimizing search, it should only be signle word, except for names like Gou Zi, Keming Chen.",
            },
            { role: "user", content: msg },
        ],
    });
    return response.choices[0].message["content"].split(",").map((word) => word.trim());;
}

async function askBlog(msg, cb, cb2) {
    const blogsKeyword = await Blog.find({}, "_id title tags votes createdAt").exec();

    const blogsKeywordStr = blogsKeyword
        .map((blog) => {
            return `id:${blog._id},title:${
                blog.title
            },tags:[${blog.tags.join(",")}],votes:${blog.votes},createdAt:${blog.createdAt}`;
        })
        .join("\n");
    
    console.log(blogsKeywordStr.length);

    const jsonResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    'given the blogs, return the blog ids which possibly have answers for user\'s question. Your response must be pure json text format with \'ids\' as key and a string array as value. Ex: {"ids":["id1", "id2"]}, you must not ```json to format your answer. blogs:' +
                    blogsKeywordStr,
            },
            { role: "user", content: msg },
        ],
    });


    const blogIds = JSON.parse(jsonResponse.choices[0].message["content"])[
        "ids"
    ];


    const blogs = await Blog.find(
        {
            _id: {
                $in: blogIds,
            },
        },
        "_id title description content updatedAt createdAt votes"
    ).exec();

    const mappedBlogs = blogs.map((blog) => {
        // Adding a custom 'status' field
        const url = "/blog/" + blog._id;

        // Return the updated user object with the new field
        return {
            title: blog.title,
            description: blog.description,
            content: blog.content,
            votes: blog.votes,
            updatedAt: blog.updatedAt,
            createdAt: blog.createdAt,
            url: url,
        };
    });

    const blogsStr = mappedBlogs
        .map((blog) => {
            return `title:${blog.title},description:${blog.description},content:${blog.content},votes:${blog.votes},updatedAt:${blog.updatedAt},createdAt:${blog.createdAt},url:${blog.url}`;
        })
        .join("\n");

    const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "You are represenative of Keming. You will receive data from Keming's blog. Users will ask you questions base on Keming's blog (If users ask 'you', 'you' refers to Keming), and if the question is not related to Keming, you must refuse to answer. You answer should base on Keming's blog. You could respond html text with tags b, i, u, div, a to format you answer, you may not use other format. Your answer should now exceed 4 sentences. Below is Keming's blog data." +
                    blogsStr,
            },
            { role: "user", content: msg },
        ],
        stream: true,
    });

    for await (const chunk of stream) {
        cb(chunk.choices[0]?.delta?.content || "");
    }

    cb2();
}


async function askProject(msg, cb, cb2) {
    const projectsKeyword = await Project.find({}, "_id title techs tags votes createdAt").exec();

    const projectsKeywordStr = projectsKeyword
        .map((project) => {
            return `id:${project._id},title:${
                project.title
            },tags:[${project.tags.join(",")}],techs:[${project.techs.join(",")}],votes:${project.votes},createdAt:${project.createdAt}`;
        })
        .join("\n");
    
    const jsonResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    'given the projects, return the blog ids which possibly have answers for user\'s question. Your response must be pure json text format with \'ids\' as key and a string array as value. Ex: {"ids":["id1", "id2"]}, you must not ```json to format your answer. projects:' +
                    projectsKeywordStr,
            },
            { role: "user", content: msg },
        ],
    });


    const projectIds = JSON.parse(jsonResponse.choices[0].message["content"])[
        "ids"
    ];


    const projects = await Project.find(
        {
            _id: {
                $in: projectIds,
            },
        },
        "_id title description techs content updatedAt createdAt votes"
    ).exec();

    const mappedProjects = projects.map((project) => {
        // Adding a custom 'status' field
        const url = "/project/" + project._id;

        // Return the updated user object with the new field
        return {
            title: project.title,
            description: project.description,
            content: project.content,
            votes: project.votes,
            updatedAt: project.updatedAt,
            createdAt: project.createdAt,
            techs: project.techs,

            url: url,
        };
    });

    const projectStr = mappedProjects
        .map((blog) => {
            return `title:${blog.title},description:${blog.description},techs:[${blog.techs.join(",")}],content:${blog.content},votes:${blog.votes},updatedAt:${blog.updatedAt},createdAt:${blog.createdAt},url:${blog.url}`;
        })
        .join("\n");

    const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "You are represenative of Keming (Keming is a person). You will receive data from Keming's projects. Users will ask you questions base on Keming's projects or ability (If users ask 'you', 'you' refers to Keming), and if the question is not related to Keming, you must refuse to answer. You answer should base on Keming's projects. You could respond html text with tags b, i, u, div, a to format you answer, you may not use other format. Your answer should now exceed 4 sentences. Below is Keming's projects data." +
                    projectStr,
            },
            { role: "user", content: msg },
        ],
        stream: true,
    });
    

    for await (const chunk of stream) {
        cb(chunk.choices[0]?.delta?.content || "");
    }

    cb2();
}

module.exports = { askBlog, generateKeywords, generateImage, askProject };
