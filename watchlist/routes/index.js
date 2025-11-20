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

    res.redirect(`/itemadded?type=${req.body.type}&title=${encodeURIComponent(req.body.title)}`);

  } catch (error) {
    console.error('Error adding item:', error);
    res.render('additem', {
      title: 'Add Item',
      errors: error.errors || { message: 'Failed to add item' },
      formData: req.body
    });
  }
});

/* GET itemadded success page */
router.get('/itemadded', function(req, res, next) {
  var type = req.query.type || 'item';
  var itemTitle = req.query.title || 'item';

  res.render('itemadded', {
    title: 'Success!',
    itemType: type,
    itemTitle: itemTitle
  });
});

/* GET catalog page. */
router.get('/catalog', async (req, res, next) => {
  try {
    var filter = {};
    
    // Filter by type (movie or show)
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Search by title (case-insensitive)
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    // Get sort parameter (default: newest first)
    var sortBy = req.query.sort || 'dateAdded';
    var sortOrder = req.query.order === 'asc' ? 1 : -1;
    var sort = { [sortBy]: sortOrder };

    // Fetch items from database
    var items = await Item.find(filter).sort(sort);

    // Count items by type and status for stats
    var stats = {
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

router.post('/item/:id/delete', async (req, res, next) => {
  try {
    var itemId = req.params.id;

    var deletedItem = await Item.findByIdAndDelete(itemId);

    if (!deletedItem) {
      return res.status(404).render('error', {
        message: 'Item not found',
        error: {status: 404}
      });
    }

    res.redirect('/catalog');

  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to delete item',
      error: error 
    });
  }
});

router.get('/item/:id/edit', async (req, res, next) => {
  try {
    var itemId = req.params.id;
    var item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).render('error', {
        title: 'Error',
        message: 'Item not found',
        error: {status: 404}
      });
    }

    res.render('edititem', {
      title: 'Edit Item',
      item: item,
      errors: null
    });

  } catch (error) {
    console.error('Error fetching item for edit:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load item for editing',
      error: error 
    });
  }
});

router.post('/item/:id/edit', async (req, res, next) => {
  try {
    var itemId = req.params.id;

    var updatedData = {
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

    if (req.body.type === 'show') {
      updatedData.totalSeasons = req.body.totalSeasons;
      updatedData.totalEpisodes = req.body.totalEpisodes;
      updatedData.currentSeason = req.body.currentSeason;
      updatedData.currentEpisode = req.body.currentEpisode;
    } else {
      updatedData.totalSeasons = undefined;
      updatedData.totalEpisodes = undefined;
      updatedData.currentSeason = undefined;
      updatedData.currentEpisode = undefined;
    }

    var updatedItem = await Item.findByIdAndUpdate(itemId, updatedData, {
       new: true, 
       runValidators: true 
      });

    if (!updatedItem) {
      return res.status(404).render('error', {
        title: 'Error',
        message: 'Item not found',
        error: {status: 404}
      });
    }

    res.redirect('/catalog');

  } catch (error) {
    console.error('Error updating item:', error);
    var item = await Item.findById(req.params.id);
    res.render('edititem', {
      title: 'Edit Item',
      item: item,
      errors: error.errors || { message: 'Failed to update item' }
    });
  }
}); 

module.exports = router;
