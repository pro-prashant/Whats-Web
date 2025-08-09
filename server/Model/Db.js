
const mongosse = require("mongoose");

const ConnectionDb = async()=>{
    try{
                await mongosse.connect(process.env.MONGO_URL);
                console.log("Db is Successfuuly Connected");
    }catch(error){
                console.log("Db is not Connected",error);
    }
}








module.exports = ConnectionDb;