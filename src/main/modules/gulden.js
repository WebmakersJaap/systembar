// Gulden tracker
var https = require('https');

var Gulden = function(app) {

    this.lastvalue = 0;
    this.direction = '<i class="fas fa-fw fa-minus"></i>';
    this.app = app;
    this.data = {
        id:12,
        title:'Gulden',
        class:'gulden',
        icon:'fab fa-gofore',
        iconLink:'https://www.vanjaap.com/systembar/gulden.php',
        help:'Shows current gulden rate'
    };

    this.start = function() {
        this.app.send('module:start', this.data);
    }

    this.tick = function(tickNr) {
        if(tickNr % 10 == 0 || tickNr == 0) {
            https.get('https://www.vanjaap.com/systembar/gulden.php?api', function(res){
                var body = '';
                res.on('data', function(chunk){ body += chunk; });
                res.on('end', function(){
                    var nlg = (function(raw) {
                        try { return JSON.parse(raw); }
                        catch (err) { return false; }
                    })(body);
                    if(!!nlg && !!nlg.data && !!nlg.data.volume && !!nlg.data.volume.amount) {
                        var volume = Math.round(nlg.data.volume.amount);
                        volume = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(volume);
                        var value = parseFloat(nlg.data.last.amount);
                        if(this.lastvalue != value) {
                            this.direction = (value > this.lastvalue ? '<i class="fas fa-fw fa-sort-up"></i>' : (value < this.lastvalue ? '<i class="fas fa-fw fa-sort-down"></i>' : '<i class="fas fa-fw fa-minus"></i>'));
                            this.app.send('module:change', {id:this.data.id, value:'<span data-title="Volume: '+volume+'">'+this.direction+' '+value+'</span>'});
                            this.lastvalue = value;
                        }
                    }
                }.bind(this));
            }.bind(this)).on('error', function(e){
                //console.log("Got an error: ", e);
            });
        }
    }
}

module.exports = Gulden;