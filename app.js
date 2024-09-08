const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');
const Blog = require("./models/blog");
const Project = require("./models/project");

const indexRouter = require("./routers/indexRouter");
const blogRouter = require("./routers/blogRouter");
const projectRouter = require("./routers/projectRouter");
const connectDB = require("./utils/database");
const { generateKeywords, generateImage } = require("./utils/chatgpt");
const app = express();

// Use ejs as view engine
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use("/", indexRouter);
app.use("/blog", blogRouter);
app.use("/project", projectRouter);

connectDB((res) => {
    console.log("Connected to mongodb.");
    app.listen(3000, () => {
        console.log("Listening port 3000.");
        // const description =
        //     "I recently bought a new Honda Accord, my first car, so I no longer have to rely on ride-hailing services. It was definitely expensive, but I hope this car will help me explore the city more easily and open up new opportunities.";
        // generateKeywords(description)
        //     .then((text) => {
                // const keywords = text.split(",").map((word) => word.trim());
                // return keywords;
        //     })
        //     .then((keywords) => {
        //         return Blog.create({
        //             title: "My First Car!",
        //             description: description,
        //             tags: keywords,
        //             content: "<h1>My First Car</h1>",
        //         });
        //     }).then((blog)=>{
        //         const imgFolder = `./public/data/blogs/${blog._id}`;
        //         if (!fs.existsSync(imgFolder))
        //             fs.mkdirSync(imgFolder)
        //         const imgPath = imgFolder + "/head-img.png"

        //         if (fs.existsSync(imgPath))
        //             fs.rmSync(imgPath)

        //         return imgPath;
        //     })
        //     .then((imgPath) => {
        //         generateImage(description, imgPath);
        //     }).then(()=>console.log("success"));


        // Project.create({
        //     title: "Terra Tracer",
        //     description:
        //         "Terra Tracer is a mobile application designed to encourage users to explore new areas by using a virtual map with a fog mechanism that unveils locations as they are visited, similar to an open-world video game.",
        //     techs: ["React Native", "Python", "Django", "Mapbox"],
        //     content: "",
        // }).then((res) => {
        //     console.log("success");
        // });
    });
});
