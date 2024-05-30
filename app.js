const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

require('dotenv').config()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()) // req.body가 객체로 인식이 된다.

const mongoURI = process.env.LOCAL_DB_ADDREESS;

mongoose.connect(mongoURI, { useNewUrlParser: true })
    .then(() => console.log("mongoose connected"))
    .catch((err) => console.log("DB Connection fail", err));

//포트 열어주기
app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running on port 5000");
})