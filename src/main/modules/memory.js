
const si = require('systeminformation');
const filesize = require('filesize');

var Memory = function(app) {

    this.app = app;
    this.data = {
        id:7,
        title:'Memory',
        class:'memory',
        icon:'fas fa-memory',
        help:'Shows memory usage'
    };

    this.start = function() {
        this.app.send('module:start', this.data);
    }

    this.tick = function(tickNr) {
        si.mem(function(data) {
            if(!!data.total && !!data.active && !!data.free) {
                this.app.send('module:change', {
                    id:this.data.id, value: '<span data-title="Total: '+
                    filesize(data.total)+'\nUsed: '+
                    filesize(data.active)+'\nFree: '+
                    filesize(data.free)+'">'+filesize(data.active)+' / '+filesize(data.total)+'</span>'
                });
            }
		}.bind(this));
    }
}

module.exports = Memory;