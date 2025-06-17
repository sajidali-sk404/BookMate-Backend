const express = require("express");
const Books = require("./routes/bookRoutes");
const Reviews = require("./routes/reviewRoutes")
const User = require("./routes/user.js")
const Favourite = require("./routes/favourite.js")
const Cart = require("./routes/cartRoutes.js")
const Order = require("./routes/orderRoutes.js")
const cors = require('cors');




const app = express();

app.use(cors({
  origin: 'https://book-mate-fronend.vercel.app'
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


app.listen(process.env.PORT, () => {
    console.log(`Server is Running successfully on PORT ${process.env.PORT}`);
})