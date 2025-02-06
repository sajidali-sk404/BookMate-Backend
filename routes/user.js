const router = require("express").Router();
const User = require("../model/user")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const {authenthicateToken} = require("./userAuth")


router.post('/sign-up', async (req, res) => {
    try {
        const { username, email, password,address } = req.body;

        if (username.length < 4) {
            return res.status(400).json({ massage: "Username should be greather than 3" })
        }

        const existingUsername = await User.findOne({ username })
        if (existingUsername) {
            return res.status(409).json({ massage: "Username already Exist" })
        }

        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.status(409).json({ massage: "Email already Exist" })
        }


        if (password.length <= 5) {
            return res.status(400).json({ massage: "Password should be greather than and equal to 6" })
        }

        const hashPass = await bcrypt.hash(password, 10)

        const newUser = new User({
            username,
            email,
            password: hashPass,
            address,
        });

        await newUser.save();
        return res.status(201).json({ massage: "User Register Successfully" })


    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }

});

router.post('/sign-in', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username })
        if(!existingUser) {
            res.status(400).json({ massage: "Invalid Password or Email" })

        }

        await bcrypt.compare(password, existingUser.password, (err, data) => {

        if(data){
            const authClaims = [
                {name: existingUser.username},
                {role: existingUser.role},
            ]
            const token = jwt.sign({authClaims}, "bookrecommend123",{
                expiresIn: "30d", 
             })
            res.status(200).json({ 
                id:existingUser._id, 
                role:existingUser.role, 
                token:token, 
            })
        } else {
            res.status(400).json({ massage: "Invalid Password or Email" })
        }
    });

    } catch (error) {
        res.status(500).json({ massage: "Internal server error" })
    }

});

router.get("/get-user-information",authenthicateToken , async (req , res) =>{
    try {
        const {id} = req.headers;
        const data = await User.findById(id).select('-password')
        return res.status(200).json(data)
    } catch (error) { 
        res.status(500).json({ massage: "Internal server error" })
    }
} )

router.put("/update-address",authenthicateToken , async (req , res) =>{
    try {
        const {id} = req.headers;
        const {address} = req.body;
        const data = await User.findByIdAndUpdate(id,{address:address});
        return res.status(200).json({massage: "Address update succesfully"})
    } catch (error) { 
        res.status(500).json({ massage: "Internal server error" })
    }
} )


module.exports = router;