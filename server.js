// imports
const express = require("express");
const methodOverride = require("method-override");
const morgan = require("morgan");
const dotenv = require("dotenv");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const session = require('express-session');

const app = express();

// Load environment variables from .env file
dotenv.config();

// Verify environment variables are being loaded
console.log(`MONGO_URI: ${process.env.MONGO_URI}`);
console.log(`SESSION_SECRET: ${process.env.SESSION_SECRET}`);

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI environment variable is not defined");
}
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is not defined");
}

// Set the port from environment variable or default to 3000
const port = process.env.PORT || 3000;

// Route Auth Controller (Router)
const authController = require("./controllers/auth.js");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));

// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));

// Morgan for logging HTTP requests
app.use(morgan('dev'));

// Express session for managing user actions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);

// Define and render the route /
app.get("/", async (req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});

// Instruct our Express app to use auth controller
app.use("/auth", authController); // Only requests with 'auth' will be executed

app.get("/vip-lounge", (req, res) => {
  if (req.session.user) {
    res.send(`Welcome to the party ${req.session.user.username}.`);
  } else {
    res.send("Sorry, no guests allowed.");
  }
});

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
