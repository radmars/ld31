var PlayState = (function() {
    "use strict";

    var pixelize = function(t) {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.LinearMipMapLinearFilter;
    };

    function Mars(game) {
        this.bgSprite    = new TQuad(game, {animations: [{frames: ['assets/textures/bg/bg.png']}]});
        this.planet      = new TQuad(game, {animations: [{frames: ['assets/textures/bg/mars.png']}]});
        this.atmosphere1 = new TQuad(game, {animations: [{frames: ['assets/textures/bg/mars_atmosphere1.png']}]});
        this.atmosphere2 = new TQuad(game, {animations: [{frames: ['assets/textures/bg/mars_atmosphere2.png']}]});

        this.bgSprite.mesh.position.z    = -1;
        this.atmosphere1.mesh.position.z = 2;
        this.atmosphere2.mesh.position.z = 2;

        this.worldObject = new THREE.Object3D();
        this.add(this.bgSprite.mesh);
        this.add(this.atmosphere1.mesh);
        this.add(this.planet.mesh);
        this.add(this.atmosphere2.mesh);
        this.worldObject.position.set( game.width / 2, game.height / 2, 0 );
        this.rotation = 0;
    }

    Mars.prototype.rotate = function(rotate) {
        this.rotation += rotate;
        if(this.rotation < - Math.PI) {
            this.rotation += Math.PI * 2
        }
        if(this.rotation > Math.PI ) {
            this.rotation -= Math.PI * 2;
        }
        this.worldObject.rotation.z = this.rotation;
    }

    Mars.prototype.addTo = function(container) {
        this.container = container;
        container.add(this.worldObject);
    }

    Mars.prototype.add = function(obj) {
        this.worldObject.add(obj);
    }

    Mars.prototype.remove = function(obj) {
        this.worldObject.remove(obj);
    }

    function Ship(game, options) {
        this.enemyId = Math.floor(Math.random() * 3 + 1);

        this.mouthSpot = {
            1: { x: -13, y: 30 },
            2: { x: -25, y: 40 },
            3: { x: -20, y: 40 }
        }[this.enemyId];

        this.fireCounter = 0;
        this.fireCounterMax = 2000 + Math.random() * 1000;

        this.quad = new TQuad(game, {
            animations: [
                {
                    frames: TQuad.enumerate( 2, 'enemies/' + this.enemyId),
                    name: 'idle',
                },
            ],
        });
        this.speed = options.speed
        if(options.speed > 0) {
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

    Ship.prototype.update = function( dt, planet ) {
        this.fireCounter += dt;

        this.rotate( dt * this.speed * Math.PI / 1800);

    }

    Ship.prototype.fire = function(){
        this.fireCounter = 0;
        var self = this;
        self.quad.setFrame(1);
        window.setTimeout(function() {
            self.firing = false;
            self.quad.setFrame(0);
        }, 1000);
        this.firing = true;
    }

    Ship.prototype.addTo = function( container ) {
        container.add(this.quad.mesh)
    };

    function PlayState() {
        State.call(this);
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
                name: 'assets/textures/missile/missile.png',
                type: 'img',
                callback: pixelize,
            }
        ]
         .concat(mapAnimationAssets(1, 'robot/idle'))
         .concat(mapAnimationAssets(1, 'tinyman/die'))
         .concat(mapAnimationAssets(1, 'tinyman/idle'))
         .concat(mapAnimationAssets(2, 'enemies/1'))
         .concat(mapAnimationAssets(2, 'enemies/2'))
         .concat(mapAnimationAssets(2, 'enemies/3'))
         .concat(mapAnimationAssets(1, 'tinyman/run'))
         .concat(mapAnimationAssets(3, 'blackhole/open'))
         .concat(mapAnimationAssets(3, 'blackhole/close'))
         .concat(mapAnimationAssets(4, 'blackhole/idle'))
         .concat(mapAnimationAssets(4, 'missile/trail'))
         .concat(mapAnimationAssets(4, 'blackhole/idle'))
         .concat(mapAnimationAssets(5, 'particles/explode'))
    };

    function mapAnimationAssets( count, name ) {
        return TQuad.enumerate(count,name).map(function(file) {
            return {
                name: file,
                type: 'img',
                callback: pixelize
            };
        });
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

        this.player = new Player(game, {});
        this.player.addTo(this.scene2d);
        this.mars = new Mars(game);

        this.ships = [];
        this.missiles = [];
        this.particles = [];

        // random angle
        for(var i = 0; i < 1; i++) {
            var ship = new Ship(game, {
                distance: Math.random() * 150 + 250,
                rotation: Math.random() * Math.PI * 2,
                speed: Math.random() - 0.5
            });
            ship.addTo(this.mars);
            this.ships.push(ship);
        }

        this.mars.addTo(this.scene2d);
    };

    PlayState.prototype.update = function(game, dt){
        State.prototype.update.call(this, game, dt);

        var self = this;
        var rotation = 0;
        if( game.input.keys[87] ) {
            this.blackhole = this.player.fire(game, this.mars);
        }

        if(this.blackhole && ! this.blackhole.closed) {
            this.missiles.forEach(function( m ) {
                m.gravitize(self.blackhole, dt);
            });
        }

        if( game.input.keys[68] ) {
            rotation -= dt * Math.PI / 1600;
            this.player.direction(false);
        }
        if( game.input.keys[65] ) {
            rotation += dt * Math.PI / 1600;
            this.player.direction(true);
        }

        this.mars.rotate(rotation);
        var self = this;

        this.ships.forEach(function(ship) {
            ship.update(dt, self.mars);

            if(ship.fireCounter > ship.fireCounterMax){
                ship.fire();
                self.missiles.push( new Missile( game, self.mars, ship.quad.mesh.rotation, ship.quad.mesh.position, ship.mouthSpot) );
            }
        });

        this.missiles.forEach(function(missile) {
            missile.update(game, dt);
            if(!missile.alive){
                self.missiles.remove(missile);
                self.particles.push(
                    new Particle(game, {
                        asset: 'particles/explode',
                        frames: 5,
                        planet: self.mars,
                        life:500,
                        position: { x: missile.quad.mesh.position.x, y: missile.quad.mesh.position.y, z: 10 }
                    })
                );
            }else{
                ///*
                if(missile.particleTimer > 150 ) {
                    //console.log("creating particle");
                    missile.particleTimer = 0;
                    self.particles.push(
                        new Particle(game, {
                            asset: 'missile/trail',
                            frames: 4,
                            planet: self.mars,
                            life:400,
                            position: { x: missile.quad.mesh.position.x, y: missile.quad.mesh.position.y, z: 10 }
                        })
                    );
                    //console.log("particle added");
                }
                //*/
            }
        });

        this.particles.forEach(function(particle) {
            particle.update(game, dt);
            if(!particle.alive){
                self.particles.remove(particle);
            }
        });

        this.player.update(game, dt);
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
