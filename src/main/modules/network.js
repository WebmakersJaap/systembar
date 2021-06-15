
const si = require('systeminformation');
const filesize = require('filesize');

var Network = function(app) {

    this.app = app;
    this.data = {
        id:4,
        title:'Network',
        class:'network',
        //icon:'fas fa-retweet',
        help:'Network information'
    };

    this.start = function() {
        this.app.send('module:start', this.data);
    };

    this.tick = function(tickNr) {
        si.networkStats('Ethernet',function(data) {
            if(!!data.rx && !!data.rx_sec && !!data.tx && !!data.tx_sec) {
                var val = '<span data-title="Network down total: '+filesize(data.rx)+'"><i class="fas fa-download"></i> '+filesize(data.rx_sec,{round:0})+'/s</span>&nbsp;|&nbsp;&nbsp;';
                val += '<span data-title="Network up total: '+filesize(data.tx)+'"><i class="fas fa-upload"></i> '+filesize(data.tx_sec,{round:0})+'/s</span>';
                this.app.send('module:change', {id:this.data.id, value: val });
            }
        }.bind(this)); // rx&tx received & transferred bytes overall
    }
}

module.exports = Network;