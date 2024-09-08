const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const blogSchema = Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    published: {
        type: Boolean,
        default: true,
        require: true,
    },
    category:{
        type: String,
        default: "Unsort",
        require: true,
    } ,
    author: {
        type: String,
        default: "Keming Chen",
        require: true,
    },
    content: {
        type: String,
        require: true,
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        require: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
        require: true,
    },
    votes: {
        type: Number,
        default: 0,
        require: true,
    },
});



blogSchema.pre("save", (next) => {
    this.updatedAt = Date.now();
    next();
});


const Blog = model("Blog", blogSchema);

module.exports = Blog;
