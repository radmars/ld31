var LoaderState = (function() {
    "use strict";

    function LoaderState( nextState ) {
        State.call(this);

        this.nextState = nextState;
        this.assets = this.nextState.getAssets();
    }

    LoaderState.prototype = Object.create(State.prototype);

    LoaderState.prototype.getAssets = function() {
        return this.assets;
    };

    LoaderState.prototype.resize = function(width, height) {
        this.camera.aspect = width / height;
        return this.camera.updateProjectionMatrix();
    };

    LoaderState.prototype.onStart = function(game) {
        this.scene = new THREE.Scene();
        game.renderer.setClearColor(0x2e2e2e, 1);
        game.renderer.autoClear = false;
        game.loader.load(this.nextState.getAssets());
        this.camera = new THREE.PerspectiveCamera(60,
            window.innerWidth / window.innerHeight,
            1,
            100
        );
        this.camera.position.y = -200;
        this.camera.position.z = 200;
        return this.camera.lookAt(new THREE.Vector3());
    };

    LoaderState.prototype.onStop = function(game) {
        return game.renderer.autoClear = true;
    };

    LoaderState.prototype.update = function(game, delta) {
        var self = this;
        if (game.loader.done(this.getAssets())) {
            game.operations.push(function() {
                return game.setState(self.nextState);
            });
        }
        game.renderer.clear();
        return game.renderer.render(this.scene, this.camera);
    };

    return LoaderState;
}).call(this);
