var PlayState = (function() {
    "use strict;"

    function Player(options){
        this.quad = new TQuad('assets/textures/robot/idle/1.png');
    }

    Player.prototype.addTo = function(container){
        container.add(this.quad.mesh);
    }

    Player.prototype.update = function(game, dt) {
        this.quad.mesh.position.set(
            game.width / 2,
            game.height / 2 - 165,
            0
        );
    }

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

    // A textured quad.
    function TQuad(fname) {
        this.material = new THREE.MeshBasicMaterial({
            map: game.loader.get( fname ),
            color: 0xffffff,
            transparent: true,
            // In order to support flipping need two sides...
            side: THREE.DoubleSide
        });

        this.width = this.material.map.image.width;
        this.height = this.material.map.image.height;


        this.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ), this.material );
        this.mesh.scale.set(
            this.material.map.image.width * 2,
            -this.material.map.image.height * 2,
            1
        );
    }


    function PlayState() {
        State.call(this);
        var pixelize = function(t) {
            t.magFilter = THREE.NearestFilter;
            t.minFilter = THREE.LinearMipMapLinearFilter;
        };

        this.assets = [
            {
                name: 'assets/textures/bg/bg.png',
                type: 'img',
                callback: pixelize,
            },
            {
                name: 'assets/textures/bg/mars.png',
                type: 'img',
                callback: pixelize,
            },
            {
                name: 'assets/textures/bg/mars_atmosphere1.png',
                type: 'img',
                callback: pixelize,
            },
            {
                name: 'assets/textures/bg/mars_atmosphere2.png',
                type: 'img',
                callback: pixelize,
            },
            {
                name: 'placeholderArt/ship.png',
                type: 'img',
                callback: pixelize,
            },
            {
                name:'assets/textures/robot/idle/1.png',
                type: 'img',
                callback: pixelize,
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

        this.bgSprite = new TQuad('assets/textures/bg/bg.png');
        this.bgSprite.mesh.position.z = -1;
        this.planet = new TQuad('assets/textures/bg/mars.png');
        this.player = new Player();
        this.atmosphere1 = new TQuad('assets/textures/bg/mars_atmosphere1.png');
        this.atmosphere1.mesh.position.z = 2;
        this.atmosphere2 = new TQuad('assets/textures/bg/mars_atmosphere2.png');
        this.atmosphere2.mesh.position.z = 2;

        this.player.addTo(this.scene2d);
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
        this.worldObject.add(this.atmosphere1.mesh);
        this.worldObject.add(this.planet.mesh);
        this.worldObject.add(this.atmosphere2.mesh);
        this.scene2d.add(this.worldObject);
        this.controllers.push(this.update.bind(this));
    };

    PlayState.prototype.update = function(game, dt){
        var rotation = 0;
        if( game.input.keys[68] ) {
            rotation -= dt * Math.PI / 1600;
        }
        if( game.input.keys[65] ) {
            rotation += dt * Math.PI / 1600;
        }
        this.ships.forEach(function(ship) {
            ship.rotate( dt * ship.speed * Math.PI / 1800);
        });

        this.player.update(game, dt);

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
