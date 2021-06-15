
const si = require('systeminformation');
const filesize = require('filesize');

var Disk = function(app) {

    this.disks = {};
    this.app = app;
    this.data = {
        id:3,
        title:'Disk',
        class:'disk',
        icon:'fas fa-hdd',
        help:'Disk information'
    };

    this.start = function() {
        this.app.send('module:start', this.data);
        si.fsSize(function(data) { // mount, fs, size, used
			for(var i in data) {
				if(!data[i].size || !data[i].used) continue;
				let val = {size:parseInt(data[i].size), used:parseInt(data[i].used)};
				this.disks[data[i].mount] = (!!this.disks[data[i].mount] ? Object.assign(this.disks[data[i].mount], val) : val);
			}
		}.bind(this));
		si.blockDevices(function(data) { // mount, name,size,physical
			for(var i in data) {
				let val = {name: data[i].name, type: data[i].physical};
				this.disks[data[i].mount] = (!!this.disks[data[i].mount] ? Object.assign(this.disks[data[i].mount], val) : val);
			}
		}.bind(this));
    }

    this.tick = function(tickNr) {
        // Disk info, once every minute
		if(tickNr%5 == 60 || tickNr < 10) {
			var val = '';
			for(var m in this.disks) {
				let d = this.disks[m];
				if(!d.used || !d.size) continue;
				val += '<div class="progress vertical inset" data-title="Total: '+filesize(d.size)+
					'\nUsed: '+filesize(d.used)
					+'\nFree: '+filesize(d.size-d.used)
				+'">';
				val += '<span>'+d.name+'</span><span class="perc" style="height:'+ Math.round((d.used*100)/d.size) +'%"></span></div>';
			}
			this.app.send('module:change', {id:3, value:val});
		}
    }
}

module.exports = Disk;