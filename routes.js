module.exports = function (app) {
    var pirates = require('./controllers/pirates');
    app.get('/api/pirates', pirates.findAll);
    app.get('/api/pirates/:id', pirates.findById);
    app.post('/api/pirates', pirates.add);
    app.put('/api/pirates/:id', pirates.update);
    app.delete('/api/pirates/:id', pirates.delete);

    app.get('/api/import', pirates.import);
}