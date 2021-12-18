const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const connecDB = require("./config/db");

const app = express();

connectDB();

app.use(express.json({ extended: true }));

app.use("/api/users", require("./routes/api/users"))
app.use("/api/auth", require("./routes/api/auth"))
app.use("/api/profile", require("./routes/api/profile"))
app.use("/api/post", require("./routes/api/posts"))

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build/index.html'));
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`app is running at ${PORT}`));