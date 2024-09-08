const mongoose = require('mongoose');

const connectDB = (cb) => {
    mongoose
        .connect(
            "mongodb+srv://keming:kruEfRuFRvtQv3EL@nodejs.yuqzrm5.mongodb.net/?retryWrites=true&w=majority&appName=NodeJs"
        )
        .then((res) => {
            cb(res);
        })
        .catch((err) => console.log(err));
};

module.exports = connectDB;