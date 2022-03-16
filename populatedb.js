// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/

var async = require('async');
var Game = require('./models/game');
var Developer = require('./models/developer');
var Genre = require('./models/genre');
var Publisher = require('./models/publisher');
var Platform = require('./models/platform');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var games = [];
var genres = [];
var developers = [];
var publishers = [];
var platforms = [];


function developerCreate(name, foundation, origin_country, cb) {
  var developer = new Developer({
    name: name,
    foundation_year: foundation,
    origin_country: origin_country
  });

  developer.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Developer: ' + developer);
    developers.push(developer);
    cb(null, developer);
  });
}


function publisherCreate(name, foundation, origin_country, cb) {
  var publisher = new Publisher({
    name: name,
    foundation_year: foundation,
    origin_country: origin_country
  });

  publisher.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Publisher: ' + publisher);
    publishers.push(publisher);
    cb(null, publisher);
  });
}


function platformCreate(name, cb) {
  var platform = new Platform({ name: name });

  platform.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Platform: ' + platform);
    platforms.push(platform);
    cb(null, platform);
  });
}


function genreCreate(name, cb) {
  var genre = new Genre({ name: name });

  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres.push(genre);
    cb(null, genre);
  });
}


function gameCreate(title, launchDate, developer, publisher, platform, summary, genre, image, cb) {
  gamedetail = {
    title: title,
    launch_date: launchDate,
    developer: developer,
    publisher: publisher,
    summary: summary
  };
  if (platform != false) gamedetail.platform = platform;
  if (genre != false) gamedetail.genre = genre;
  if (image != '') gamedetail.image_url = image;

  var game = new Game(gamedetail);
  game.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Game: ' + game);
    games.push(game);
    cb(null, game);
  });
}


function createGenreDevelopers(cb) {
  async.series([
    function (callback) {
      developerCreate('The Behemoth', 2003, 'United States', callback);
    },
    function (callback) {
      developerCreate('Yacht Club Games', 2011, 'United States', callback);
    },
    function (callback) {
      developerCreate('Team Cherry', 2014, 'Australia', callback);
    },
    function (callback) {
      developerCreate('Nicalis', 2007, 'United States', callback);
    },
    function (callback) {
      developerCreate('Cellar Door Games', 2009, 'Canada', callback);
    },
    function (callback) {
      developerCreate('FromSoftware', 1986, 'Japan', callback);
    },
    function (callback) {
      developerCreate('Nintendo', 1889, 'Japan', callback);
    },
    function (callback) {
      developerCreate('Square Enix', 1975, 'Japan', callback);
    },
    function (callback) {
      developerCreate('Santa Monica Studio', 1999, 'United States', callback);
    },
    function (callback) {
      developerCreate('Valve Corporation', 1996, 'United States', callback);
    }
  ],
    // optional callback
    cb);
}


function createGenrePublishers(cb) {
  async.series([
    function (callback) {
      publisherCreate('ZeniMax Media', 1999, 'United States', callback);
    },
    function (callback) {
      publisherCreate('Konami', 1969, 'Japan', callback);
    },
    function (callback) {
      publisherCreate('Square Enix', 1975, 'Japan', callback);
    },
    function (callback) {
      publisherCreate('Valve Corporation', 1996, 'United States', callback);
    },
    function (callback) {
      publisherCreate('Take-Two Interactive', 1993, 'United States', callback);
    },
    function (callback) {
      publisherCreate('Sony Computer Entertainment', 1993, 'Japan', callback);
    },
    function (callback) {
      publisherCreate('Electronic Arts', 1982, 'United States', callback);
    },
    function (callback) {
      publisherCreate('Nintendo', 1889, 'Japan', callback);
    },
    function (callback) {
      publisherCreate('Ubisoft', 1986, 'France', callback);
    },
    function (callback) {
      publisherCreate('Devolver Digital', 2009, 'United States', callback);
    }
  ],
    // optional callback
    cb);
}

function createGenrePlatforms(cb) {
  async.series([
    function (callback) {
      platformCreate('PC', callback);
    },
    function (callback) {
      platformCreate('Play Station 5', callback);
    },
    function (callback) {
      platformCreate('Play Station 4', callback);
    },
    function (callback) {
      platformCreate('xBox Series X', callback);
    },
    function (callback) {
      platformCreate('xBox One', callback);
    },
    function (callback) {
      platformCreate('Nintendo Switch', callback);
    }
  ],
    // optional callback
    cb);
}


function createGames(cb) {
  async.parallel([
    function (callback) {
      gameCreate('Bloodborne',
        new Date(2015, 03, 26),
        developers[5],
        publishers[5],
        [platforms[0],],
        "Bloodborne follows the player's character, a Hunter, through the decrepit Gothic, Victorian era inspired city of Yharnam, whose inhabitants are afflicted with a blood-borne disease. Attempting to find the source of the plague, the player's character unravels the city's mysteries while fighting beasts and cosmic beings.",
        [genres[0],],
        'https://i.3djuegos.com/juegos/11033/project_beast/fotos/ficha/project_beast-2739557.jpg',
        callback);
    },
    function (callback) {
      gameCreate('Super Mario Odyssey',
        new Date(2017, 10, 27),
        developers[6],
        publishers[7],
        [platforms[5],],
        'Super Mario Odyssey is a platform game in which players control Mario as he travels across many different worlds, known as "Kingdoms" within the game, on the hat-shaped ship Odyssey, to rescue Princess Peach from Bowser, who plans to forcibly marry her.',
        [genres[0],],
        'https://m.media-amazon.com/images/I/7166XhITc1L._AC_SX466_.jpg',
        callback);
    },
    function (callback) {
      gameCreate('The Legend of Zelda: Breath of the Wild',
        new Date(2017, 03, 03),
        developers[6],
        publishers[7],
        [platforms[5],],
        "Breath of the Wild is the nineteenth installment of The Legend of Zelda franchise and is set at the end of the Zelda timeline. The player controls Link, who awakens from a hundred-year slumber to defeat Calamity Ganon and restore the kingdom of Hyrule.",
        [genres[0],],
        'https://static.wikia.nocookie.net/zelda/images/c/c7/BotW_NA_Switch_Box_Art.png/revision/latest?cb=20170419020706&path-prefix=es',
        callback);
    },
    function (callback) {
      gameCreate('Super Smash Bros. Ultimate',
        new Date(2018, 12, 07),
        developers[6],
        publishers[7],
        [platforms[5],],
        'Super Smash Bros. Ultimate is a platform fighter for up to eight players in which characters from Nintendo games and other third-party franchises must try to knock each other out of an arena.',
        [genres[0],],
        'https://static.wikia.nocookie.net/ssbb/images/b/b0/Car%C3%A1tula_SSBU.png/revision/latest?cb=20180925224949&path-prefix=es',
        callback);
    },
    function (callback) {
      gameCreate('Animal Crossing: New Horizons',
        new Date(2020, 03, 20),
        developers[6],
        publishers[7],
        [platforms[5],],
        'Escape to a deserted island and create your own paradise as you explore, create, and customize in the Animal Crossing: New Horizons game.',
        [genres[0],],
        'https://m.media-amazon.com/images/I/81QvUXy2qpL._AC_SX466_.jpg',
        callback);
    }
  ],
    // optional callback
    cb);
}


async.series([
  createGenreDevelopers,
  createGenrePublishers,
  createGenrePlatforms,
  createGames
],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    }

    // All done, disconnect from database
    mongoose.connection.close();
  });




