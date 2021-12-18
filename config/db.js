const mongoose = require('mongoose');

const config = require('config');

const db = config.get("mongoURI");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://kaungmyathan:kaungmyathan@cluster0.netvj.mongodb.net/devcamp?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

}

module.exports = connectDB;