// Empty trashbin?
var Trash = function(app) {

    this.app = app;
    this.data = {
        id:11,
        title:'Trash',
        class:'trash',
        icon:'fas fa-trash',
        help:'Empty'
    };

    this.start = function() {
        this.app.send('module:start', this.data);
    }

    this.tick = function(tickNr) {

    }
}

module.exports = Trash;