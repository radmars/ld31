var PlayState = (function() {
    "use strict;"
    function PlayState() {
        State.call(this);
        this.assets = [
            {
                name: 'assets/models/bomb.js',
                type: 'model'
            }
        ];
    };

    PlayState.prototype = Object.create(State.prototype);

    PlayState.prototype.getAssets = function() {
        return this.assets;
    };


    PlayState.prototype.onStart = function(game) {
        var self = this;

        this.scene2d = new THREE.Scene();
        this.camera2d = new THREE.OrthographicCamera( 0, game.width, 0, game.height );
        this.camera2d.position.z = 10;

        game.renderer.setClearColor(0x2e2e2e, 1);
        game.renderer.autoClear = false;

        var bgMaterial = new THREE.MeshBasicMaterial({
            map: game.loader.get( "assets/intro/intro_bg.png" ),
            color: 0xffffff
        });


        this.bgSprite = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), bgMaterial );
        this.bgSprite.scale.set( 800, -600, 1 );

        this.worldObject = new THREE.Object3D();
        this.worldObject.add(this.bgSprite);

        this.scene2d.add(this.worldObject);
        this.controllers.push(this.update.bind(this));
    };

    PlayState.prototype.update = function(game, dt){
        var rotation = 0;
        if( game.input.keys[68] ) {
            rotation += dt * Math.PI / 800;
        }
        if( game.input.keys[65] ) {
            rotation -= dt * Math.PI / 800;
        }
        this.bgSprite.rotation.z += rotation;

        this.bgSprite.position.set( this.cx, 400, 0 );
    }


    PlayState.prototype.resize = function(width, height) {
        this.cx = width / 2;
        this.cy = height / 2;
        this.camera2d.right = width;
        this.camera2d.bottom = height;
        this.camera2d.updateProjectionMatrix();
    };

    PlayState.prototype.onStop = function(game) {
        game.input.keyUpEvent.remove(this.keyHandler);
        game.renderer.autoClear = true;
    };

    PlayState.prototype.render = function(game) {
        game.renderer.clear();
        game.renderer.render(this.scene2d, this.camera2d);
    };

    return PlayState;
}).call(this);
