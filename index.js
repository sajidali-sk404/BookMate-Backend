require("dotenv").config();
const express = require("express");
const Books = require("./routes/bookRoutes");
const Reviews = require("./routes/reviewRoutes");
const User = require("./routes/user.js");
const Favourite = require("./routes/favourite.js");
const Cart = require("./routes/cartRoutes.js");
const Order = require("./routes/orderRoutes.js");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_LOCAL_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(null, true);
      }
    },
    credentials: true,
  })
);

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