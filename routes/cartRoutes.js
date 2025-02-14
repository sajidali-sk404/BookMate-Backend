const router = require("express").Router();
const User = require("../model/user")
const { authenthicateToken } = require("./userAuth")

router.put('/addbook-to-cart', authenthicateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers;
        const userData = await User.findById(id);
        const isBookinCart = userData.cart.includes(bookid);
        
        if (isBookinCart) {

            return res.status(200).json({ massage: "Book already In Cart" })
        }

        await User.findByIdAndUpdate(id, { $push: { cart: bookid } })
        return res.status(200).json({ massage: "Book Added To Cart" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Internal server error" })
    }
})

router.put('/removebook-from-cart/:bookid', authenthicateToken, async (req, res) => {
    try {
        const { bookid } = req.params;
        const { id } = req.headers;
            await User.findByIdAndUpdate(id, { $pull: { cart: bookid } })
        return res.json({ status:"Success",
             massage: "Book Remove From Cart",
             })
    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }
})

router.get('/getcart-books', authenthicateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const userData = await User.findById(id).populate("cart")
        const cartBooks = userData.cart;
        const cart = userData.cart.reverse();

        return res.json({status: "Succes", data: cartBooks});
        
        
    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }
})

module.exports = router;