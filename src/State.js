var State = (function() {
    "use strict;"
    function State() {
        this.controllers = [];
    }

    State.prototype.renderFrame = function(game, delta) {
        this.controllers.forEach(function(c) {
            c.update(delta);
        });
    };

    State.prototype.getAssets = function() {
        return [];
    };

    State.prototype.onStart = function(game) {
    };

    State.prototype.onStop = function(game) {
    };

    State.prototype.render = function(game) {
    };

    State.prototype.resize = function(width, height) {
    };
    return State;
}());
