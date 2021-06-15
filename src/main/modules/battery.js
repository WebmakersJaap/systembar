// Battery info?

//data-0="empty" data-25="quarter" data-50="half" data-75="three-quarters" data-100="full"
//si.battery(function(data) {}); // hasbattery,ischarging,maxcapacity,currentcapacity,percent,acconnected

var Battery = function(app) {

    this.app = app;
    this.data = {
        id:10,
        title:'Battery',
        class:'battery',
        icon:'fas fa-battery-full',
        help:'Shows battery status'
    };

    this.start = function() {
        this.app.send('module:start', this.data);
    }
    this.tick = function(tickNr) {

    }
}

module.exports = Battery;