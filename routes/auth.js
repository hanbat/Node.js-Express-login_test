var express = require('express');
var router = express.Router();
var passport = require('passport');

var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'test'
});

connection.connect(function(err) {
  
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('DB is Connected Successfully');
  
});


connection.query("select count(*) from users", function(err, rows, fields){

  if(err) throw err;

  console.log('Users in the database : ', rows[0] );


});


// Render the registration page.
router.get('/register', function(req, res) {
  res.render('register', {title: 'Register', error: req.flash('error')[0]});
});


// Register a new user to Stormpath.
router.post('/register', function(req, res) {

  var username = req.body.username;
  var password = req.body.password;

  // Grab user fields.
  if (!username || !password) {
    return res.render('register', {title: 'Register', error: 'Email and password required.'});
  }


  connection.query('select * from users where email="' + username + '" limit 1', function(err,rows,fields){

    if (err) throw err;

    if (rows.username)
      console.log('The user with email : ' + username + ' cannot be registered.');

    else {

      connection.query('insert into users SET ?', {email: username, password: password}, function(err, result){

        if (err) throw err;

        else {

          console.log('User is Successfully created.');
          req.session.regenerate(function(){

            req.session.user = username;
            res.redirect('/');

          });

        }

      });

    }



  });

});

// Render the login page.
router.get('/login', function(req, res) {
  res.render('login', {title: 'Login', error: req.flash('error')[0]});
});


// Authenticate a user.
router.post('/login', function(req, res){


  var username = req.body.username;
  var password = req.body.password;

  console.log(username);
  console.log(password);

  // Grab user fields.
  if (!username || !password) {
    return res.render('login', {title: 'Login', error: 'Email and password required.'});
  }

  connection.query('select * from users where email="' + username + '" and password="' + password + '" limit 1', function(err,rows,fields){

      if (err) throw err;


      console.log(rows);
      if (rows[0].email) {

          req.session.regenerate(function(){

            req.session.user = username;
            res.redirect('/dashboard');

          });
      }

      else 
          return res.render('login', {title: 'Login', error: 'Email or password is wrong.'});
    });
});


// Logout the user, then redirect to the home page.
router.get('/logout', function(req, res) {
  
  req.session.destroy(function(){
    res.redirect('/');
  });

});


module.exports = router;