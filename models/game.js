var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 100 },
    launch_date: { type: Date, required: true },
    developer: { type: Schema.Types.ObjectId, ref: 'Developer', required: true },
    publisher: { type: Schema.Types.ObjectId, ref: 'Publisher', required: true },
    platform: [{ type: Schema.Types.ObjectId, ref: 'Platform' }],
    summary: { type: String, required: true },
    genre: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
    image_url: { type: String }
  }
);

GameSchema
  .virtual('url')
  .get(function () {
    return '/catalog/game/' + this._id;
  });

module.exports = mongoose.model('Game', GameSchema);