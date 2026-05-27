import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"


dotenv.config();

const app= express();
const port = process.env.PORT || 3001;
const databaseURL =  process.env.DATA_BASE_URL;


app.use(cors({
    origin:process.env.ORIGIN,
    method:["GET","POST","PUT","PATCH","DELETE"],
    credentials: true,
})
);


app.use("/upload/profiles",express.static("uploads/profiles"));



app.use(cookieParser());
app.use(express.json());

const server = app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`)
});

mongoose.connect(databaseURL).then(()=>console.log('DB Connection Successful')).catch(err=>console.log(err.message));