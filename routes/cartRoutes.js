const router = require("express").Router();
const User = require("../model/user")
const { authenthicateToken } = require("./userAuth")

router.put('/addbook-to-cart', authenthicateToken, async (req, res) => {
  try {
    const { bookid, id } = req.headers;

    if (!id || !bookid) {
      return res.status(400).json({ message: "User ID and Book ID are required in headers" });
    }

    const userData = await User.findById(id);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const isBookInCart = userData.cart.includes(bookid);
    if (isBookInCart) {
      return res.status(200).json({ message: "Book already in cart" });
    }

    await User.findByIdAndUpdate(id, { $push: { cart: bookid } });
    return res.status(200).json({ message: "Book added to cart" });
  } catch (error) {
    console.error("addbook-to-cart error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put('/removebook-from-cart/:bookid', authenthicateToken, async (req, res) => {
    try {
        const { bookid } = req.params;
        const { id } = req.headers;
            await User.findByIdAndUpdate(id, { $pull: { cart: bookid } })
        return res.json({ status:"Success",
             message: "Book Remove From Cart",
             })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
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
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router;