/**
 * https://github.com/piotrraczynski/squeezenode/blob/master/squeezeplayer.js
 */

var jayson = require('jayson');

function SqueezeRequest(address, port, playerid) {

    this.defaultPlayer = "00:00:00:00:00:00";
    this.playerId = playerid;
    this.address = (address !== undefined) ? address : "localhost";
    this.port = (port !== undefined) ? port : 9000;
    this.client = jayson.client.http('http://'+this.address + ':' + this.port + '/jsonrpc.js');
    this.client.options.version = 1;
    this.connected = true;

    this.init = function() {
        this.client.request('slim.request', [this.defaultPlayer, ["players", 0, 100]], null, function (err, reply) {
            if (err) this.connected = false;
            else this.connected = true;
        }.bind(this));
        /*this.getStatus(function(data) {
            console.log(data);
        });*/
    }

    this.handle = function(err, reply, callback) {
        var result = {};
        if (err) {
            result = err;
            result.ok = false;
        }
        else {
            result = reply;
            result.ok = true;
        }
        if (!!callback) callback(result);
    };

    this.request = function (player, params, callback) {
        if(!player || !this.connected) return;
        var finalParams = [];
        finalParams.push(player);
        finalParams.push(params);
        this.client.request('slim.request', finalParams, null, function (err, reply) {
           this.handle(err, reply, callback);
        }.bind(this));
    };

    this.serverStatus = function (callback) {
        this.request(this.defaultPlayer, ["serverstatus", 0, 999], callback);
    };

    this.getPlayers = function (callback) {
        this.request(this.defaultPlayer, ["players", 0, 100], function (reply) {
            if (reply.ok) reply.result = reply.result.players_loop;
            callback(reply);
        });
    };

    this.getMode = function (callback) {
        this.request(this.playerId, ["mode", "?"], callback);
    };

    this.getName = function (callback) {
        this.request(this.playerId, ["name", "?"], callback);
    };

    this.getCurrentTitle = function (callback) {
        this.request(this.playerId, ["current_title", "?"], function (reply) {
            if (reply.ok) reply.result = reply.result._current_title;
            callback(reply);
        });
    };

    this.getArtist = function (callback) {
        this.request(this.playerId, ["artist", "?"], function (reply) {
            if (reply.ok) reply.result = reply.result._artist;
            callback(reply);
        });
    };

    this.getAlbum = function (callback) {
        this.request(this.playerId, ["album", "?"], function (reply) {
            if (reply.ok) reply.result = reply.result._album;
            callback(reply);
        });
    };

    this.getCurrentRemoteMeta = function (callback) {
        this.request(this.playerId, ["status"], function (reply) {
            if (reply.ok)
                reply.result = reply.result.remoteMeta;
            callback(reply);
        });
    };

    this.getStatus = function (callback) {
        this.request(this.playerId, ["status"], callback);
    };
   /* { params: [ '00:04:20:12:22:db', [ 'status' ] ],
    method: 'slim.request',
    result:
     { seq_no: '0',
       'mixer volume': '28',
       player_name: 'Squeezebox',
       playlist_tracks: '2',
       player_connected: '1',
       time: '1447.25213423157',
       mode: 'play',
       playlist_timestamp: '1533290803.27915',
       remote: '1',
       rate: '1',
       power: '1',
       'playlist mode': 'off',
       'playlist repeat': '0',
       playlist_cur_index: '1',
       signalstrength: '0',
       remoteMeta:
        { id: '-183077268',
          title: 'Beautiful Day ',
          artist: 'Gare Du Nord',
          duration: '0' },
       'playlist shuffle': '0',
       current_title: 'Beautiful Day ',
       player_ip: '192.168.30.107:44454' },
    ok: true }*/

    this.getStatusWithPlaylist = function (from, to, callback) {
        this.request(this.playerId, ["status", from, to], function (reply) {
            if (reply.ok)
                reply.result = reply.result;
            callback(reply);
        });
    };

    this.getPlaylist = function (from, to, callback) {
        this.request(this.playerId, ["status", from, to], function (reply) {
            if (reply.ok)
                reply.result = reply.result.playlist_loop;
            callback(reply);
        });
    };

    this.play = function (callback) {
        this.request(this.playerId, ["play"], callback);
    };

    this.pause = function (callback) {
        this.request(this.playerId, ["pause"], callback);
    };

    this.previousSong = function (callback) {
        this.request(this.playerId, ["button", "jump_rew"], callback);
    };

    this.nextSong = function (callback) {
        this.request(this.playerId, ["button", "jump_fwd"], callback);
    };

    this.sync = function(syncTo, callback) {
        this.request(playerId, ["sync", syncTo], callback);
    };

    this.seek = function(seconds, callback) {
        this.request(playerId, ["time", seconds], callback);
    };

    this.setVolume = function(volume, callback) {
        this.request(this.playerId, ["mixer", "volume", volume], callback);
    };

    this.getVolume = function(callback) {
        this.request(this.playerId, ["mixer", "volume", "?"], function(reply) {
            if (reply.ok) reply.result = reply.result._volume;
            callback(reply);
        });
    };

    this.init();
}

module.exports = SqueezeRequest;