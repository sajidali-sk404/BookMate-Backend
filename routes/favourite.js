const router = require("express").Router();
const User = require("../model/user")
const { authenthicateToken } = require("./userAuth")

router.put('/addbook-to-favourite', authenthicateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers;
        const userData = await User.findById(id);
        const isBookFavourite = userData.favourites.includes(bookid);
        if (isBookFavourite) {

            return res.status(200).json({ message: "Book already In Favourite" })
        }

        await User.findByIdAndUpdate(id, { $push: { favourites: bookid } })
        return res.status(200).json({ message: "Book Added To Favourites" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})

router.put('/removebook-from-favourite', authenthicateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers;
        const userData = await User.findById(id);
        const isBookFavourite = userData.favourites.includes(bookid);
        if (isBookFavourite) {
            await User.findByIdAndUpdate(id, { $pull: { favourites: bookid } })
        }
        

        return res.status(200).json({ message: "Book Remove From Favourites" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get('/getfavourite-books', authenthicateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const userData = await User.findById(id).populate("favourites")
        const favouriteBooks = userData.favourites;

        return res.json({status: "Succes", data: favouriteBooks});
        
        
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router;