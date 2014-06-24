var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/admin', function(req, res) {
  // res.send('Welcome to the ADMIN page');
  res.render('admin');
  
});

module.exports = router;
