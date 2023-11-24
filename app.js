// app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');


const app = express();
const PORT = 3000;


app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1/nodejs-password-hash', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a simple User model
const User = mongoose.model('User', {
  email: String,
  password: String,
});

// function for hashpassword
  async function hashpassword(password){
   // Hash the password
   const hashedPassword = await bcrypt.hash(password, 10);
   return hashedPassword;
}

// Express route to register a user
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hash the password
    const hashedPassword =await hashpassword(password);
    // console.log("hashedPasswordt",hashedPassword);

    // Create a new user with the hashed password
    const newUser = new User({ email, password: hashedPassword });

    // Save the user to the database
    await newUser.save();

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// compare password function
async function comparePasswords(plaintextPassword, hashpassword) {

  // console.log('hashpassword',plaintextPassword,hashpassword);
    const match = await bcrypt.compare(plaintextPassword, hashpassword);
    // console.log("match",match);
    return match;
}

// Express route to login a user
  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  // console.log("password",password,email)

      // Find the user in the database
      const user = await User.findOne({ email:email });
  
      // If the user doesn't exist or the passwords don't match, send an error response
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).send('Invalid credentials');
      }
  
      res.status(200).send('Login successful');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
