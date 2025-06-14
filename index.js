const express = require("express");
const Books = require("./routes/bookRoutes");
const Reviews = require("./routes/reviewRoutes")
const User = require("./routes/user.js")
const Favourite = require("./routes/favourite.js")
const Cart = require("./routes/cartRoutes.js")
const Order = require("./routes/orderRoutes.js")
const cors = require('cors');




const app = express();

  res.setHeader("Access-Control-Allow-Origin", "https://book-mate-fronend.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

app.use(cors({
  origin: 'https://book-mate-fronend.vercel.app',
  origin: 'http://localhost:5173',
    credentials: true
}));

require("dotenv").config();

 const db = require('./database/db.js');

           


 
 app.use(express.json())
 
 app.use("/api", User)

app.use("/api", Books)

app.use("/api", Reviews)

app.use("/api", Favourite)

app.use("/api", Cart)

app.use("/api", Order)

app.options('*', cors());

app.listen(process.env.PORT, () => {
    console.log(`Server is Running successfully on PORT ${process.env.PORT}`);
})