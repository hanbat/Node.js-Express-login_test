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

	if ( !req.session.user ) 
		return res.redirect('/login');

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


	console.log('Current session user : ' + req.session.user);
	console.log(req.body);

	var user_id;

	connection.query("select * from account inner join users u on u.id = account.user_id where email ='" + req.session.user + "'", function(err, rows, fields){

	  if(err) throw err;

	  user_id = rows[0].user_id;

	  console.log(user_id);

	  console.log(req.body.name.split(' ')[0]);
	  console.log(req.body.name.split(' ')[1]);

	  connection.query("update account set address='" + req.body.address + "' where user_id=" + user_id + ";");
	  connection.query("update account set contact='" + req.body.contact + "' where user_id=" + user_id + ";");
	  connection.query("update account set first_name='" + req.body.name.split(' ')[0] + "' where user_id=" + user_id + ";");
	  if( req.body.name.split(' ')[1] !== undefined )
	  	connection.query("update account set last_name='" + req.body.name.split(' ')[1] + "' where user_id=" + user_id + ";");
	 else
	 	connection.query("update account set last_name=' ' where user_id=" + user_id + ";");

	  res.redirect('/dashboard');

	});

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
