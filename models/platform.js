var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlatformSchema = new Schema(
  {
    name: { type: String, required: true, maxLength: 100 },
  }
);

PlatformSchema
  .virtual('url')
  .get(function () {
    return '/catalog/platform/' + this._id;
  });

module.exports = mongoose.model('Platform', PlatformSchema);