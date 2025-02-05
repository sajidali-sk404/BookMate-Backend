const router = require("express").Router();
const Book = require("../model/books")
const Order = require("../model/orderRoutes")
const User = require("../model/user")

const { authenthicateToken } = require("./userAuth");

router.get('/getorder-history', authenthicateToken, async (req, res) => {
    try {
        const { id } = req.header;
        const { order } = req.body;
        for (const orderData of order) {
            const newOrder = new order({ user: id, book: orderData._id })
            const orderDataFromDb = await newOrder.save();

            await User.findByIdAndUpdate(id ,{$push: {order: orderDataFromDb._id}});


            await User.findByIdAndUpdate(id ,{$pull: {cart: orderData._id}});
        }
        return res.json({status: "Succes",
            massage: "Order place Successfully",
        })

    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }
})

router.get('/getall-orders', authenthicateToken, async (req, res) => {
    try {
      
        const userData = await Order.find().populate({
            path: "books",
        }).populate({
            path: "user",
        }).sort({createdAt: -1});

        
        return res.json({
            status: "Succes",
            data:userData,
        })

    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }
})

router.put('/update-status/:id', authenthicateToken, async (req, res) => {
    try {
      const {id} = req.params;
      await Order.findByIdAndUpdate(id, {status: req.body.status});


        
        return res.json({
            status: "Succes",
             massage: "Status Update successfully",
        })

    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }
})

module.exports = router;