const mongoose = require('mongoose');

const connectDB = (cb) => {
    mongoose
        .connect(
            process.env.MONGODB_URI
        )
        .then((res) => {
            cb(res);
        })
        .catch((err) => console.log(err));
};

module.exports = connectDB;