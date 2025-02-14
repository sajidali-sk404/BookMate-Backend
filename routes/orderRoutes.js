const router = require("express").Router();
const Order = require("../model/order")
const Book = require("../model/books")
const User = require("../model/user")

const { authenthicateToken } = require("./userAuth");

router.post('/place-order', authenthicateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const { order } = req.body;

        for (const orderData of order) {
            const newOrder = new Order({ user: id, book: orderData._id })
            const orderDataFromDb = await newOrder.save();

            await User.findByIdAndUpdate(id, { $push: { order: orderDataFromDb._id } });

            // clearing Cart
            await User.findByIdAndUpdate(id, { $pull: { cart: orderData._id } });
        }
        return res.json({
            status: "Succes",
            massage: "Order place Successfully",
        })

    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }

})

router.get('/getorder-history', authenthicateToken, async (req, res) => {
    try {
        const { id } = req.headers;  // Use req.headers to get the ID
        const userData = await User.findById(id).populate({
            path: 'order',
            populate: {
                path: 'book',  // Ensure that you populate the 'book' field in 'order'
                model: 'Book',
                select: 'title desc price' // Only select necessary fields to reduce data load
            }
        });

        const ordersData = userData.order.reverse();

        return res.json({
            status: "Success",
            data: ordersData
        });


    } catch (error) {
        console.log(error); // Log the error for debugging
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get('/getall-orders', authenthicateToken, async (req, res) => {
    try {

        const userData = await Order.find().populate({
            path: "book",
        }).populate({
            path: "user",
        }).sort({ createdAt: -1 });


        return res.json({
            status: "Succes",
            data: userData,
        })

    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }
})

router.put('/update-status/:id', authenthicateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await Order.findByIdAndUpdate(id, { status: req.body.status });



        return res.json({
            status: "Succes",
            massage: "Status Update successfully",
        })

    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }
})

module.exports = router;