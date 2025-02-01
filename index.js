const express = require("express");
const Books = require("./routes/bookRoutes");
const Reviews = require("./routes/reviewRoutes")
const cors = require('cors');




const app = express();

app.use(cors());
require("dotenv").config();

 const db = require('./database/db.js');

 



app.use(express.json())

app.use("/api", Books)

app.use("/api", Reviews)

app.listen(process.env.PORT, () => {
    console.log(`Server is Running successfully on PORT ${process.env.PORT}`);
})