var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeveloperSchema = new Schema(
  {
    name: { type: String, required: true, maxLength: 100 },
    foundation_year: { type: Number, required: true, min: 1850 },
    origin_country: { type: String, default: 'Unknown' }
  }
);

DeveloperSchema
  .virtual('url')
  .get(function () {
    return '/catalog/developer/' + this._id;
  });

module.exports = mongoose.model('Developer', DeveloperSchema);