const express = require('express');

const router = express.Router();

// imported from the user-model.js! (module.exports=User)
const User = require('../models/user-model');

// to encrypt the password we need to install and require BCRUPTJS (or BCRYPT)
const bcrypt = require('bcryptjs');
const bcryptSalt = 10; // means how many rounds of hashing


// this is the get route to display the form for users to signup
router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
})

// from the signup hbs => 
// <form action="/signup" method="post">
router.post('/signup', (req, res, next) => {
  // console.log(req.body);
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  // all users must input both Email and Password
  if(userEmail == '' || userPassword == ''){
  res.render('auth/signup', { errorMessage: 'Please provide both, email and password, in order to create an account!'});
  return; // remember return cuts execution therefore 'else' is not needed
  // in order to avoid having huge else statement, just put return
  }
  //              find by 'email'
  User.findOne({ email: userEmail})
  .then( foundUser => {
    if( foundUser !== null ){
      res.render('auth/signup', { errorMessage: 'Sorry, the account with that email already exist. Please try with another email.' })
      return;
    }

    // salt will be hashed 10 times based on the rounds called on bcryptSalt
    const salt     = bcrypt.genSaltSync(bcryptSalt);
    // hashPass is our encrypted password
    const hashPass = bcrypt.hashSync(userPassword, salt);
    
    
    User.create({
      // email and password are the keys from User model
      email: userEmail,
      password: hashPass
      // userEmail and hashPass are the ones our user inputs (but password gets encrypted into hashPass)
    })
    .then( newUser => {
      console.log('New user is: ', newUser);
      res.redirect('/');
    })
    .catch(err => {
      console.log("Error while creating new user: ", err)
    }); // <=== closes User.create()

  }) // note to self: .catch above is another way to type the below .catch method
  .catch(err => console.log('Error while checking if use exists: ', err)); // <=== closes User.findOne()

})

// LOGIN GET ROUTE - to display the form

router.get('/login', (req, res, next) => {
  res.render('auth/login');
})

// LOGIN POST ROUTE - to get data from the form and the password comparison

router.post('/login', (req, res, next) => {

  const userLoginEmail = req.body.email;
  const userLoginPassword = req.body.password;

  // all users must input both Email and Password
  if(userLoginEmail == '' || userLoginPassword == ''){
    res.render('auth/login', { errorMessage: 'Please provide both, email and password, in order to login!'});
    return; // remember return cuts execution therefore 'else' is not needed
    // in order to avoid having huge else statement, just put return
    }


  User.findOne({ email: userLoginEmail })
  .then( user => {
    if(!user){
      res.render('auth/login', { errorMessage: 'There is no user with provided email, so please create an account first!' })
      return;
    }
    // .compareSync receives 2 arguments: the password "user" just inputted in the login form and the hashed password that is saved in
    if(bcrypt.compareSync( userLoginPassword, user.password )){
      // currentUser is just stating this user; user is referencing the findOne 'user'
      // in req.session object create a new key (currentUser) and set it equal to the user we found based on the userLoginEmail
      // this will make req.session.currentUser available throughout the whole app
      req.session.currentUser = user;



      res.redirect('/')
    } else {
      res.render('auth/login', { errorMessage: 'Incorrect password!' })
    }
  })
})


// private page set up: 
// setting a middleware with rules that will not allow user to continue if not logged in:
router.use((req, res, next) => {
  if(req.session.currentUser){
    next(); // <== goes to next step which in this case is take the user to the "private" page below after this middleware login
  } else {
    res.redirect('/login');
  }
})

router.get('/private', (req, res, next) => {
  res.render('user-pages/private-page', { user: req.session.currentUser })
})


// terminate session / log out
router.get('/logout', (req, res, next) => {
  req.session.destroy(err => {
    console.log('Error while logging out: ', err);
    res.redirect('/login');
  })
})



module.exports = router;