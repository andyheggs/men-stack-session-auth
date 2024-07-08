const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    //unique: true //enables unique ID. (unique to MongoDB)

  },
  password: {
    //schema.types.mixed = (documentation), to require a combo of password string/int
    type: String,
    required: true,

  },
});

const User = mongoose.model("User", userSchema);
//models also enables crud actions on data
module.exports = User;


