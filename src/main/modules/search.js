// Google
const {shell} = require('electron')

var Search = function(app) {

    this.app = app;
    this.data = {
        id:9,
        title:'Search',
        class:'search',
        icon:'fab fa-google',
        iconLink:'https://google.com/',
        help:'Search on google',
        html: `<input type="text" value="" name="q" id="searchInput" placeholder="Search google">`
    };

    this.start = function() {
        this.app.send('module:start', this.data);
    }

    this.receive = function(data) {
        shell.openExternal('https://google.com/search?q='+data);
    }
}

module.exports = Search;