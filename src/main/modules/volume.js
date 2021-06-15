
const SqueezeRequest = require('./squeezerequest');

var Volume = function(app) {

    this.app = app;
    this.squeeze = new SqueezeRequest('192.168.30.15',9002,'00:04:20:12:22:db');
    this.data = {
        id:1,
        title:'Volume',
        class:'volume',
        icon:'fas fa-volume-up',
        help:'Control system volume',
        html:`<div class="volValue">??%</div><div class="progress inset" style="width:70px;"><span class="perc" style="width:0%"></span></div>`
    };

    this.start = function() {
        this.app.send('module:start', this.data);
    }

    this.tick = function(tickNr) {
        if(tickNr%3 == 0 || tickNr == 0) {
            this.squeeze.getVolume(function(data) {
                this.app.send('module:change', {id:this.data.id, value:data.result});
            }.bind(this));
        }
    }

    this.receive = function(data) {
        this.squeeze.setVolume(parseInt(data));
    }
}

module.exports = Volume;