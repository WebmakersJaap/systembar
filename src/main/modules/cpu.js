
const si = require('systeminformation');

var CPU = function(app) {

    this.app = app;
    this.data = {
        id:6,
        title:'CPU',
        class:'cpu',
        icon:'fas fa-microchip',
        help:'Shows CPU usage'
    };

    this.start = function() {
        this.app.send('module:start', this.data);
        /*si.currentLoad(function(data) {
            console.log(data);
        });*/
    }

    this.tick = function(tickNr) {
        si.currentLoad(function(data) {
            var load = (Math.round(data.currentload * 100) / 100);
            var val = '<span data-title="Current: '+load+'%"'+(load>90?' class="danger"':'')+'>'+load+'%</span>';
            this.app.send('module:change', {id:this.data.id, value: val });
        }.bind(this));
    }
}

module.exports = CPU;