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


/* GET home page. */
router.get('/', function(req, res) {

  	console.log('Current session user : ' + req.session.user);

	res.render('index', {title: 'Home', user: req.session.user});

});

router.get('/dashboard', function(req,res){

	console.log('Current session user : ' + req.session.user);
	// if ( !req.session.user || req.user.status !== 'ENABLED' ) 
	if ( !req.session.user ) 
		return res.redirect('/login');

	connection.query("select * from account inner join users u on u.id = account.user_id where email ='" + req.session.user + "'", function(err, rows, fields){

	  if(err) throw err;


	  
	  res.render('dashboard', {title: 'Dashboard',
	  						   user: req.session.user,
	  						   address: rows[0].address,
	  							contact : rows[0].contact,
	  							first_name : rows[0].first_name,
	  							last_name : rows[0].last_name});

	});

});


router.get('/edit_account', function(req, res){

	console.log('Current session user : ' + req.session.user);





	connection.query("select * from account inner join users u on u.id = account.user_id where email ='" + req.session.user + "'", function(err, rows, fields){

	  if(err) throw err;


	  
	res.render('edit_account', {title: 'Dashboard',
	  						   user: req.session.user,
	  						   address: rows[0].address,
	  							contact : rows[0].contact,
	  							first_name : rows[0].first_name,
	  							last_name : rows[0].last_name});

	});
});


router.post('/edit_account', function(req, res){


});

router.get('/men', function(req,res){

	console.log('Current session user : ' + req.session.user);

	console.log();

	res.render('men', {title: 'PARIOLI', user: req.session.user});

});

router.get('/women', function(req,res){

	console.log('Current session user : ' + req.session.user);


	res.render('women', {title: 'PARIOLI', user: req.session.user});


});

module.exports = router;
