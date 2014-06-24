var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');

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

  
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  console.log('hashed password is : ' + hash);
  password = hash;

  // Grab user fields.
  if (!username || !password) {
    return res.render('register', {title: 'Register', error: 'Email and password required.'});
  }


  connection.query('select * from users where email="' + username + '" limit 1', function(err,rows,fields){

    if (err) throw err;

    console.log(rows[0]);

    if (rows[0]){
      
      console.log('The user with email : ' + username + ' cannot be registered.');
      return res.render('register', {title: 'Register', error: 'The email is already registered, Please choose a new one.'});
    }

    else {
      connection.query('insert into users SET ?', {email: username, password: password}, function(err, result){

        if (err) throw err;

        else {

          console.log('User is Successfully created.');
          req.session.regenerate(function(){


            connection.query('select * from users where email="' + username + '" limit 1', function(err,rows,fields){
              
              connection.query('insert into account SET ?', {address: 'Please update your address', contact: 'Please update your contact', first_name: 'Please update your name', user_id: rows[0].id});

                req.session.regenerate(function(){

                  req.session.user = username;
                  res.redirect('/dashboard');

                });

            });

          });
        }
      });
    }
  });

});

router.get('/change_password', function(req, res){

    if ( !req.session.user ) 
    return res.redirect('/login');

  res.render('change_password', {user: req.session.user});


});

router.post('/change_password', function(req, res){


  console.log('Current session user : ' + req.session.user);

  var newPassword = req.body.newPassword;
  var oldPassword = req.body.oldPassword;
  var confirm = req.body.confirm;

  if (newPassword.length == 0 || oldPassword.length == 0 || confirm.length == 0)
    return res.render('change_password', {title: 'Change Password', error: 'Please fill all the fields'});
  

  if ( newPassword != confirm ) 
    return res.render('change_password', {title: 'Change Password', error: 'Passwords do not match'});

  connection.query('select * from users where email="' + req.session.user + '" limit 1', function(err,rows,fields){

    console.log(bcrypt.compareSync(oldPassword, rows[0].password));
  
    if (!bcrypt.compareSync(oldPassword, rows[0].password))
      return res.render('change_password', {title: 'Change Password', error: 'Password is wrong'});

    else {

    // console.log("LOLOL");
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(newPassword, salt);

      // connection.query("update account set address='" + req.body.address + "' where user_id=" + user_id + ";");
      connection.query("update users set password='" + hash + "' where email='"+ req.session.user + "';");
      // console.log("LOLOL gagain");
      res.redirect('/dashboard');
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

  connection.query('select * from users where email="' + username + '" limit 1', function(err,rows,fields){

      if (err) throw err;


      console.log(rows);
      if (rows[0]) {

          dbPassword = rows[0].password;
          console.log(bcrypt.compareSync(password, dbPassword));
          if ( bcrypt.compareSync(password, dbPassword) ){

            req.session.regenerate(function(){

              req.session.user = username;
              res.redirect('/dashboard');

            });

          } else {
            return res.render('login', {title: 'Login', error: 'Email or password is wrong.'});  
          }
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