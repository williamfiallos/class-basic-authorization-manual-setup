const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true 
  }}, {
    // timestamps tells us when info was created and lastly updated in our database
    timestamps: true
  });

const User = mongoose.model('User', userSchema);

module.exports = User;