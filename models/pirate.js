var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PirateSchema = new Schema({
    name: String,
    vessel: String,
    weapon: String
});

mongoose.model('Pirate', PirateSchema);