const mongoose = require("mongoose")

const connection = async () => {
    const URL = process.env.URI

    try{
    await mongoose.connect(`${URL}`);
        console.log('connected to database ')
    }catch(error)
    {
        console.log('Error while connecting with the database ' , error)
    }
}

 connection();