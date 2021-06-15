
var Keyboard = function(app) {

    this.app = app;
    this.data = {
        id:8,
        title:'Keyboard',
        class:'keyboard',
        icon:'fas fa-keyboard',
        help:'Active keyboard keys',
        html:`<div class="key numLock">NL</div>
        <div class="key capsLock">CL</div>
        <div class="key scrollLock">SL</div>`
    };

    this.start = function() {
        this.app.send('module:start', this.data);
    }
}

module.exports = Keyboard;