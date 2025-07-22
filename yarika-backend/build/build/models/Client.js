const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const ClientSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  password: { type: String, required: false, select: false },
  addresses: [AddressSchema],
  emailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationExpires: { type: Date },
}, { timestamps: true });

// 🔒 Hash password before saving
ClientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Sign JWT token
ClientSchema.methods.getSignedJwtToken = function () {
  try {
    console.log('Generating JWT token for user:', this._id);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    console.log('JWT token generated successfully');
    return token;
  } catch (error) {
    console.error('JWT token generation error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// 🔍 Match user entered password to hashed password
ClientSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    console.log('Password comparison - entered password length:', enteredPassword?.length);
    console.log('Password comparison - stored password exists:', !!this.password);
    
    if (!this.password) {
      console.log('No stored password found');
      return false;
    }
    
    const result = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password comparison result:', result);
    return result;
  } catch (error) {
    console.error('Password comparison error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
};

module.exports = mongoose.model("Client", ClientSchema);
