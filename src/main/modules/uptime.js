
const si = require('systeminformation');
const moment = require('moment');

var Uptime = function(app) {

    this.app = app;
    this.data = {
        id:5,
        title:'Uptime',
        class:'uptime',
        icon:'fas fa-clock',
        help:'Total time this device is running'
    };

    this.start = function() {
        this.app.send('module:start', this.data);
    }

    this.tick = function(tickNr) {
        var days = Math.floor(si.time().uptime / (60*60*24));
        var uptime = (days>0?days+'d ':'');
		uptime += moment.utc(moment.duration(si.time().uptime, 'seconds').asMilliseconds()).format('HH:mm:ss');
		this.app.send('module:change', {id:this.data.id, value:'Up: '+uptime});
    }
}

module.exports = Uptime;