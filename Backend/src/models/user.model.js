import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
    },
    verified:{
        type: Boolean,
        default: false,
    },
    // Set when the account signs in with Google (optional, additive)
    googleId:{
        type: String,
        index: true,
    },
    avatar:{
        type: String,
    },
},{timestamps: true});


// Hash password before saving
userSchema.pre("save",async function(){
    if(!this.isModified("password")) return; // this line means if the password is not modified, then we don't need to hash it again, so we just call return to exit the function early. This is important because if we don't do this, then every time we save the user, even if we are just updating the username or email, the password will be hashed again, which is not what we want.
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
}

const userModel = mongoose.model("User", userSchema);
 
export default userModel;