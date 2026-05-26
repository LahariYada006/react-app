import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is Required."],
        unique: true,
    },
    password:{
        type: String,
        required: [true,"Password is Required."],
    },
    firstName:{
        type:String,
        required: false,
    },
    lastName:{
        type: String,
        required: false,
    },
    image:{
        type:String,
        required:false,
    },
    color:{
        type:Number,
        required: false,
    },
    profileSetup:{
        type: Boolean,
        default:false,
    },
});


userSchema.pre("save", async function(){
    if(!this.isModified("password")) return;
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("Users",userSchema);

export default User;