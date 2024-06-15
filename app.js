const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const indexRouter = require("./routes/index")
require('dotenv').config()
const app = express();

const MONGODB_URI_PROD = process.env.MONGODB_URI_PROD
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()) // req.body가 객체로 인식이 된다.

app.use("/api", indexRouter);
const mongoURI = MONGODB_URI_PROD;

mongoose.connect(mongoURI, { useNewUrlParser: true } )
    .then(() => console.log("mongoose connected"))
    .catch((err) => console.log("DB Connection fail", err));

//Opening a port
app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running on port 5000");
})