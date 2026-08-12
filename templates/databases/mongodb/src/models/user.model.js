const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      maxlength: [128, "Password cannot exceed 128 characters"],
      select: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);

const User = {
  async create(data) {
    const user = await UserModel.create(data);

    return user.toObject();
  },

  async findByEmail(email) {
    return UserModel.findOne({ email })
      .select("+password")
      .lean();
  },

  async findById(id) {
    return UserModel.findById(id)
      .select("-password")
      .lean();
  },

  async updateById(id, data) {
    return UserModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-password")
      .lean();
  },

  async deleteById(id) {
    return UserModel.findByIdAndDelete(id)
      .select("-password")
      .lean();
  },
};

module.exports = User;