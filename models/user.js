const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    photo: {
    data: Buffer,
    contentType: String
  },
    categories: {
      type: [String],
      default: [
        "All",
        "Grocery 🛒",
        "Food 🍴",
        "Travel ✈️",
        "Entertainment 🎮",
        "Education 📚",
        "Health 🏥",
        "Shopping 🛍️",
        "Bills 💡",
        "Loans 💳",
        "Others 🌀",
      ],
    },

    isSubscribed: {
      type: Boolean,
      default: false,
    },
    subscription: {
      startDate: {
        type: Date,
        default: Date.now,
      },
      validity: {
        type: Date,
        default: function () {
          return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        },
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
