const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const projectSchema = Schema({
    title: {
        type: String,
        require: true,
    },
    techs: {
        type: [String],
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
    author: {
        type: String,
        require: true,
    },
    developers: {
        type: [String],
        require: true
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

projectSchema.pre("save", (next) => {
    this.updatedAt = Date.now();
    next();
});


const Project = model("Project", projectSchema);
module.exports = Project;
