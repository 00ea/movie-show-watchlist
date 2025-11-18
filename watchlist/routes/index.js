var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'Home' });
});

/* GET catalog page. */
router.get('/catalog', function(req, res, next) {
  res.render('catalog', { title: 'Catalog' });
});

/* GET additem page. */
router.get('/additem', function(req, res, next) {
  res.render('additem', { title: 'Add Item' });
});

router.post('/additem', async function(req, res) {
  await Book.create(req.body);
  res.redirect('/itemadded');
});

// Book Added
router.get('/itemadded', function(req, res) {
  res.render('itemadded', { title: 'Success!' });
});


module.exports = router;
