const mongoose=require("mongoose");

 const connectDB=async()=>{
    try {
        console.log("trying to cnnect");
        await mongoose.connect(process.env.DB);
        console.log("database connected successfully")
    } catch (error) {
        console.log("DB coudnt connnected error is ",error);
    }
    
}
module.exports=connectDB;