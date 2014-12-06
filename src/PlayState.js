var PlayState = (function() {
    "use strict;"
    function Ship(options) {
        this.quad = new TQuad('placeholderArt/ship.png');
        this.speed = options.speed
        if(options.speed < 0) {
            this.quad.mesh.scale.x *= -1;
        }
        this.orbitDistance = options.distance || 50;
        this.rotation = 0;
        this.rotate(options.rotation || 0);
    }

    Ship.prototype.rotate = function( rads ) {
        this.rotation += rads;
        // REMEMBER YOUR TRIG LADS?
        this.quad.mesh.rotation.z = Math.PI/2 + this.rotation;
        this.quad.mesh.position.set(
            Math.cos(this.rotation),
            Math.sin(this.rotation),
            0
        );
        this.quad.mesh.position.multiplyScalar( this.orbitDistance );
    }

    Ship.prototype.addTo = function( container ) {
        container.add(this.quad.mesh)
    };

    function TQuad(fname) {
        this.material = new THREE.MeshBasicMaterial({
            map: game.loader.get( fname ),
            color: 0xffffff,
            // In order to support flipping need two sides...
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), this.material );
        this.mesh.scale.set(
            this.material.map.image.width,
            -this.material.map.image.height,
            1
        );
    }


    function PlayState() {
        State.call(this);
        this.assets = [
            {
                name: 'placeholderArt/planet.png',
                type: 'img'
            },
            {
                name: 'placeholderArt/ship.png',
                type: 'img'
            },
            {
                name:'placeholderArt/robot.png',
                type: 'img'
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

        this.bgSprite = new TQuad('placeholderArt/planet.png');
        this.player = new TQuad('placeholderArt/robot.png');


        this.worldObject = new THREE.Object3D();

        this.ships = [];

        // random angle
        for(var i = 0; i < 4; i++) {
            var ship = new Ship({
                distance: i*50 + 200,
                rotation: Math.random() * Math.PI * 2,
                speed: Math.random() - 0.5
            });
            ship.addTo(this.worldObject);
            this.ships.push(ship);
        }

        this.worldObject.add(this.bgSprite.mesh);

        this.scene2d.add(this.worldObject);
        this.scene2d.add(this.player.mesh);
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
        this.ships.forEach(function(ship) {
            ship.rotate( dt * ship.speed * Math.PI / 1200);
        });
        this.worldObject.rotation.z += rotation;

        this.worldObject.position.set( this.cx, 400, 0 );
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
