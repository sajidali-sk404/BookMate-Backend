const jwt = require('jsonwebtoken')

const authenthicateToken = (req, res , next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(token === null) {
        return res.status(401).json({massage: "Authentication Token required"})
    }
    jwt.verify(token, "bookrecommend123", (err, user)=>{
        if(err){
           return res.status(403).json({massage: "Token is Expired please SignIn again"})
        }
        req.user = user;
        next();
    })
}

module.exports = {authenthicateToken}