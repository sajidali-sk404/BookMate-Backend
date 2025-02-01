const express = require("express");
const Books = require("./routes/bookRoutes");
const Reviews = require("./routes/reviewRoutes")
const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:5173', // Allow only requests from localhost:5173
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


const app = express();

app.use(cors(corsOptions));
require("dotenv").config();

 const db = require('./database/db.js');

 



app.use(express.json())

app.use("/api", Books)

app.use("/api", Reviews)

app.listen(process.env.PORT, () => {
    console.log(`Server is Running successfully on PORT ${process.env.PORT}`);
})