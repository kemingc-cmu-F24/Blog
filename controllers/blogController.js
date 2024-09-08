const Blog = require("../models/blog");
const { askBlog, generateKeywords } = require("../utils/chatgpt");
var showdown = require("showdown");

const getIndex = async (req, res, next) => {
    const BLOGS_PER_PAGE = 5;

    const categoryList = await Blog.find({}, "category")
        .distinct("category")
        .exec();

    const DEFAULT_CATEGORY = "All";

    categoryList.unshift(DEFAULT_CATEGORY);

    let category = req.query.category;

    let filter = {};
    if (category) filter = { category: category };
    else category = DEFAULT_CATEGORY;

    const totalDocuments = await Blog.countDocuments(filter);
    const maxPage = Math.ceil(totalDocuments / BLOGS_PER_PAGE);
    let page = 1;
    if (req.query["page"]) {
        page = req.query.page;
        page = Math.min(page, maxPage);
    }

    const pageStart = Math.max(page - 2, 1);
    const pageEnd = Math.min(maxPage, page + 2);

    const pageList = Array(pageEnd - pageStart + 1)
        .fill(1)
        .map((v, i) => pageStart + i);

    const blogs = await Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(BLOGS_PER_PAGE * (page - 1))
        .limit(BLOGS_PER_PAGE)
        .exec();

    return res.render("blog-list", {
        path: "/blog",
        blogs: blogs,
        page: page,
        pageList: pageList,
        maxPage: maxPage,
        category: category,
        categoryList: categoryList,
    });
};

const postAskBlog = async (req, res, next) => {
    // const blogs = await Blog.find(
    //     {},
    //     "_id title description updatedAt createdAt"
    // ).exec();

    // const mappedBlogs = blogs.map((blog) => {
    //     // Adding a custom 'status' field
    //     const url = "/blog/" + blog._id;

    //     // Return the updated user object with the new field
    //     return {
    //         title: blog.title,
    //         description: blog.description,
    //         updatedAt: blog.updatedAt,
    //         createdAt: blog.createdAt,
    //         url: url,
    //     };
    // });

    // const blogsStr = mappedBlogs.map((blog) => {
    //     return `title: ${blog.title}, description: ${blog.description}, updatedAt: ${blog.updatedAt}, createdAt: ${blog.createdAt}, url: ${blog.url}`;
    // }).join("\n");

    await askBlog(
        req.body.msg,
        (text) => {
            res.write(text);
        },
        () => res.end()
    );
};

const getBlog = async (req, res, next) => {
    const id = req.params.id;
    const schemaFields = Object.keys(Blog.schema.paths); // Get all schema field names
    // const projection = schemaFields.join(' ') + ' contentHTML'; // Create the projection string

    const blog = await Blog.findById(id).exec();

    const relatedBlogs = await getRelatedBlogs(blog);
    (converter = new showdown.Converter()),
        (blog.content = converter.makeHtml(blog.content.replaceAll(
            "${this}",
            `/data/blogs/${blog._id}`
        )));
    return res.render("blog", {
        path: "/blog",
        blog: blog,
        relatedBlogs: relatedBlogs,
    });
};

const getRelatedBlogs = async (blog) => {
    const id = blog._id;
    const tags = blog.tags;
    const blogs = await Blog.find({
        _id: {
            $ne: id,
        },
    }).exec();

    const relatedBlogs = [];
    for (let blog of blogs) {
        for (let tag of tags) {
            const blogTags = blog.tags.map((tag) => tag.toLowerCase());

            // let relate = false;

            // for (let bt of blogTags) {
            if (blogTags.includes(tag.toLowerCase())) {
                relatedBlogs.push(blog);
                break;
                //     }
                // }
            }
            // if (relate) break;
        }
    }

    return relatedBlogs;
};

const postUpdateBlog = async (req, res, next) => {
    const id = req.body.id;

    const blog = await Blog.findById(id);

    const blogStr = `${blog.title}, ${blog.description}, ${blog.content}`;

    const keywords = await generateKeywords(blogStr);

    blog.tags = keywords;

    blog.save();
};

module.exports = { getIndex, postAskBlog, getBlog, postUpdateBlog };
