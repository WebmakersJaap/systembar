
const {remote,ipcRenderer} = require('electron');
var modules = {};
var win = remote.getCurrentWindow();

$(function() {
    function LBModule(data) {
        for(var k in data) this[k] = data[k];

        this.obj = $('<div class="module'+(!!this.class?' '+this.class:'')+'" data-title="'+this.title+' - '+this.help+'"></div>').appendTo('#content');
        this.render = function() {
            var html = '';
            if(!!this.icon) {
                html += (!!this.iconLink ? '<a class="icon link" href="'+this.iconLink+'" target="_blank">' : '<div class="icon">');
                html += '<i class="fa-fw '+this.icon+'"></i>'+(!!this.iconLink ? '</a>' : '</div>');
            }
            this.obj.html(html+(!!this.html?this.html:'')+'<div class="value"></div>');
            if(this.id == 1) {
                this.progress = $('.progress' ,this.obj);
                this.progress.off('mousedown mousemove mouseup mouseleave mousewheel').on('mousedown', function(e) {
                    $(this.progress).addClass('dragging');
                }.bind(this)).on('mousemove', function(e) {
                    if($(this.progress).hasClass('dragging') && e.offsetX>0) {
                        $('.volValue', this.obj).text(e.offsetX+'%');
                        $('.perc', this.progress).width(e.offsetX+'%');
                    }
                }.bind(this)).on('mouseup mouseleave', function(e) {
                    if($(this.progress).hasClass('dragging') && e.offsetX > 0 && e.offsetX < 100) setVolume(e.offsetX,true);
                    $(this.progress).removeClass('dragging');
                }.bind(this)).on('mousewheel', function(e) {
                    var startVol = parseInt($('.volValue', this.obj).text()), step = 4;
                    if(e.originalEvent.wheelDelta/120 > 0) startVol = (startVol+step<=100 ? startVol+step : startVol);
                    else startVol = (startVol-step >= 0 ? startVol-step : startVol);
                    setVolume(startVol,true);
                }.bind(this));
            }
            if(this.id == 2) {
                $('.fa-fast-backward', this.obj).off('click').on('click', function() { ipcRenderer.send('module:change', {key:'music',data:'previous'}); });
                $('.fa-play', this.obj).off('click').on('click', function() { ipcRenderer.send('module:change', {key:'music',data:'play'}); });
                $('.fa-pause', this.obj).off('click').on('click', function() { ipcRenderer.send('module:change', {key:'music',data:'pause'}); });
                //$('.fa-stop', this.obj).off('click').on('click', function() { ipcRenderer.send('module:change', {key:'music',data:'stop'}); });
                $('.fa-fast-forward', this.obj).off('click').on('click', function() { ipcRenderer.send('module:change', {key:'music',data:'forward'}); });
                this.textDir = -1; // to the left first
                this.textIndent = 0;
                setInterval(function() {
                    var step = 1, sw = $('.trackinfo span', this.obj).width(), tw = $('.trackinfo', this.obj).width();
                    if((sw-tw) > 10) {
                        this.textIndent = this.textIndent+(this.textDir*step);
                        if(this.textIndent < -1*(sw-tw)) this.textDir = 1;
                        if(this.textIndent >= 0) this.textDir = -1;
                    } else { this.textIndent = 0; this.textDir = -1; }
                    $('.trackinfo', this.obj).css('text-indent', this.textIndent);
                }.bind(this), 150);
            }
            if(this.id == 8) {
                $(document).off('keydown keyup char keypress mousemove').on('keydown keyup char keypress mousemove', function(event) {
                    let e = event.originalEvent;
                    $('.key.numLock').toggleClass('active', e.getModifierState('NumLock'));
                    $('.key.capsLock').toggleClass('active', e.getModifierState('CapsLock'));
                    $('.key.scrollLock').toggleClass('active', e.getModifierState('ScrollLock'));
                });
            }
            if(this.id == 9) {
                $('#searchInput').off('keydown').on('keydown', function(e) {
                    if(e.keyCode == 13) {
                        ipcRenderer.send('module:change', {key:'search',data:$(this).val()});
                        $(this).val('');
                    }
                });
            }
        }.bind(this);
        this.change = function(data) {
            if(this.id == 1) { setVolume(data.value,false); return; }
            $('.value', this.obj).html(data.value);
            if(this.id == 2) { $('.trackinfo', this.obj).css('text-indent', this.textIndent); }
        }.bind(this);
        this.render();
    };

    function setVolume(vol,send) {
        if(vol >= 0 && vol <= 100) {
            $('.volume .volValue').text(vol+'%');
            $('.volume .perc', this.progress).width(vol+'%');
            if(!!send) ipcRenderer.send('module:change', {key:'volume',data:vol});
        }
    }

    $('#app').off('mouseenter mouseleave').on('mouseenter', function() {
        win.setIgnoreMouseEvents(false);
    }).on('mouseleave', function() {
        win.setIgnoreMouseEvents(true, {forward: true});
    }).trigger('mouseleave');
    $("#min-btn").off('click').on("click", function(e) {
        win.minimize();
    });
    $("#max-btn").off('click').on("click", function(e) {
        win.maximize();
    });
    $("#close-btn").off('click').on("click", function(e) {
        win.close();
    });

    $(document).on('mouseover', '[data-title]', function(e) {
        var obj = $(e.target).closest('[data-title]');
        var title = obj.attr('data-title').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
        $('#caption').html(title).css({left:obj.offset().left+'px'}).show();
    }).on('mouseout', '[data-title]', function(e) {
        $('#caption').hide();
    });

    ipcRenderer.on('module:start', function(e,data) {
        modules[data.id] = new LBModule(data);
    });
    ipcRenderer.on('module:change', function(e,data) {
        if(!!modules[data.id]) modules[data.id].change(data);
    });
});