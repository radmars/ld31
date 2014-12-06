var State = (function() {
    "use strict;"
    function State() {

        // controllers are things that have an update function that takes a
        // delta time.
        this.controllers = [];
    }

    State.prototype.update = function(game, delta) {
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
