
const SqueezeRequest = require('./squeezerequest');

var Music = function(app) {
    this.time = 0;
    this.app = app;
    this.squeeze = new SqueezeRequest('webmks-ad-01',9000,'00:04:20:12:22:db');
    this.data = {
        id:2,
        title:'Music',
        class:'music',
        icon:'fas fa-music',
        iconLink: 'http://webmks-ad-01:9000/',
        help:'Music control',
        html:`<div>
            <i class="fas fa-fw fa-fast-backward"></i>
            <i class="fas fa-fw fa-play"></i>
            <i class="fas fa-fw fa-pause"></i>
            <i class="fas fa-fw fa-fast-forward"></i>
        </div>` //<i class="fas fa-fw fa-stop"></i>
    };

    this.start = function() {
        this.app.send('module:start', this.data);
    }

    this.str_pad_left = function(string,pad,length) {
        return (new Array(length+1).join(pad)+string).slice(-length);
    }
    this.sendTrackInfo = function() {
        if(this.artist==false && this.title==false) return;
        if(this.artist!=false && this.title != false && this.title.substr(0,this.artist.length) == this.artist) {
            this.title = this.title.substr(this.artist.length);
            if(this.title.substr(0,3) == ' - ') this.title = this.title.substr(3);
        }
        var nowPlayingData = (this.artist!=''?this.artist+' - ':'')+this.title;
        var minutes = Math.floor(this.time / 60);
        var seconds = this.time - minutes * 60;
        var time = '<div class="tracktime" style="width:25px">'+this.str_pad_left(minutes,0,2)+':'+this.str_pad_left(seconds,0,2)+'</div>';
        var info = '<div class="trackinfo" data-title="'+nowPlayingData+'"><span>'+nowPlayingData+'</span></div>';
        this.app.send('module:change', {id:this.data.id, value:'<div class="inset" style="display:flex;width:150px;">'+time+''+info+'</div>'});
    }

    this.tick = function(tickNr) {
        // Music updates, once every 3 seconds
		if(tickNr%3 == 0 || tickNr == 0) {
            this.artist = this.title = false;
            this.squeeze.getArtist (function(data) {
                this.artist = (!!data.result ? data.result : false);
                this.sendTrackInfo();
            }.bind(this));
            this.squeeze.getCurrentTitle(function(data) {
                this.title = (!!data.result ? data.result : false);
                this.sendTrackInfo();
            }.bind(this));
        }
        this.squeeze.getStatus(function(data) {
            this.time = (!!data.result && !!data.result.time ? parseInt(data.result.time) : false);
            this.sendTrackInfo();
        }.bind(this));
    }

    this.receive = function(data) {
        switch(data) {
            case 'previous':
                this.squeeze.previousSong();
            break;
            case 'play':
                this.squeeze.play();
            break;
            case 'pause':
                this.squeeze.pause();
            break;
            case 'stop':
                // que?
            break;
            case 'forward':
                this.squeeze.nextSong();
            break;
        }
    }
}

module.exports = Music;