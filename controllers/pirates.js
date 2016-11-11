var mongoose = require('mongoose'),
    Pirate = mongoose.model('Pirate');

exports.findAll = function (req, res) {
    Pirate.find({}, function (err, results) {
        return res.send(results);
    });
};
exports.findById = function (req, res) {
    var id = req.params.id;
    Pirate.findOne({ '_id': id }, function (err, result) {
        return res.send(result)
    });
};

exports.add = function () { };

exports.update = function (req, res) {
    var id = req.params.id;
    var updates = req.body;
    Pirate.update({ '_id': id }, req.body,
        function (err, numberAffected) {
            if (err) return console.log(err);
            console.log('Updated pirates', numberAffected);
            return res.sendStatus(202);
        })
};

exports.delete = function () { };

exports.import = function (req, res) {
    Pirate.create(
        { "name": "William Kidd", "vessel": "Adventure Galley", "weapon": "Sword" },
        { "name": "Samuel Bellamy", "vessel": "Whydah", "weapon": "Cannon" },
        { "name": "Mary Read", "vessel": "Rackham", "weapon": "Knife" },
        { "name": "John Rackham", "vessel": "The Calico", "weapon": "Peg Leg" }
        , function (err) {
            if (err) return console.log(err);
            return res.send(202);
        });
};


















