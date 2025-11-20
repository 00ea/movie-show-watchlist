var express = require('express');
var router = express.Router();
var Item = require('../models/item'); 

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'Home' });
});

/* GET additem page. */
router.get('/additem', function(req, res, next) {
  res.render('additem', { 
    title: 'Add Item',
    errors: null,
    formData: {} 
  });
});

/* POST additem - Handle form submission */
router.post('/additem', async (req, res, next) => {
  try {
    var itemData = {
      type: req.body.type,
      title: req.body.title, 
      genre: req.body.genre.split(',').map(g => g.trim()),
      releaseYear: req.body.releaseYear,
      director: req.body.director,
      duration: req.body.duration,
      imdbRating: req.body.imdbRating || undefined,
      personalRating: req.body.personalRating || undefined,
      status: req.body.status || 'Not Started'
    };

    // Add show-specific fields if type is 'show'
    if (req.body.type === 'show') {
      itemData.totalSeasons = req.body.totalSeasons;
      itemData.totalEpisodes = req.body.totalEpisodes;
      itemData.currentSeason = req.body.currentSeason || 1;
      itemData.currentEpisode = req.body.currentEpisode || 0;
    }

    var newItem = new Item(itemData);
    await newItem.save();

    res.redirect('/itemadded');

  } catch (error) {
    console.error('Error adding item:', error);
    res.render('additem', {
      title: 'Add Item',
      errors: error.errors || { message: 'Failed to add item' },
      formData: req.body
    });
  }
});

/* GET catalog page. */
router.get('/catalog', async (req, res, next) => {
  try {
    const filter = {};
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Get sort parameter (default: newest first)
    const sortBy = req.query.sort || 'dateAdded';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Fetch items from database
    const items = await Item.find(filter).sort(sort);

    // Count items by type and status for stats
    const stats = {
      total: await Item.countDocuments(),
      movies: await Item.countDocuments({ type: 'movie' }),
      shows: await Item.countDocuments({ type: 'show' }),
      notStarted: await Item.countDocuments({ status: 'Not Started' }),
      inProgress: await Item.countDocuments({ status: 'In Progress' }),
      completed: await Item.countDocuments({ status: 'Completed' })
    };

    res.render('catalog', {
      title: 'Catalog',
      items: items,
      stats: stats,
      currentFilter: req.query,
      errors: null
    });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    res.render('catalog', {
      title: 'Catalog',
      items: [],
      stats: {},
      currentFilter: {},
      errors: 'Failed to load catalog'
    });
  }
});

/* GET itemadded success page */
router.get('/itemadded', function(req, res) {
  res.render('itemadded', { title: 'Success!' });
});

module.exports = router;
