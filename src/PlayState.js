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

        this.alive = true;

        this.mouthSpot = {
            1: { x: -13, y: 30 },
            2: { x: -25, y: 40 },
            3: { x: -20, y: 40 }
        }[this.enemyId];

        this.fireCounter = 0;
        this.fireCounterMax = 3000 + Math.random() * 4000;

        this.quad = new TQuad(game, {
            animations: [
                {
                    frames: TQuad.enumerate( 2, 'enemies/' + this.enemyId),
                    name: 'idle',
                },
            ],
        });
        this.speed = options.speed;
        if(options.speed > 0) {
            this.quad.mesh.scale.x *= -1;
            this.mouthSpot.x *= -1;
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
        this.planet = planet;
        this.fireCounter += dt;

        if(!this.firing){
         this.rotate( dt * this.speed * Math.PI / 1800);
        }
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

    Ship.prototype.die = function(){
        if(this.alive){
            this.alive = false;
            this.planet.remove(this.quad.mesh);
        }
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
         .concat(mapAnimationAssets(2, 'tinyman/die'))
         .concat(mapAnimationAssets(1, 'tinyman/idle'))
         .concat(mapAnimationAssets(2, 'enemies/1'))
         .concat(mapAnimationAssets(2, 'enemies/2'))
         .concat(mapAnimationAssets(2, 'enemies/3'))
         .concat(mapAnimationAssets(2, 'tinyman/run'))
         .concat(mapAnimationAssets(20, 'robot/shoot'))
         .concat(mapAnimationAssets(3, 'blackhole/close'))
         .concat(mapAnimationAssets(3, 'blackhole/open'))
         .concat(mapAnimationAssets(4, 'blackhole/idle'))
         .concat(mapAnimationAssets(4, 'missile/trail'))
         .concat(mapAnimationAssets(4, 'robot/jump'))
         .concat(mapAnimationAssets(4, 'robot/walk'))
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

        this.score = 0;

        this.scene2d = new THREE.Scene();
        this.camera2d = new THREE.OrthographicCamera( 0, game.width, 0, game.height );
        this.camera2d.position.z = 10;
        this.font = new TextRenderer.Font({
            font: "monospace",
            size: 32,
            fgColor: 'white',
        });

        game.renderer.setClearColor(0x2e2e2e, 1);
        game.renderer.autoClear = false;

        this.player = new Player(game, {});
        this.player.addTo(this.scene2d);
        this.mars = new Mars(game);

        this.shakeTime = 0;
        this.scoreCounter = 0;

        this.ships = [];
        this.missiles = [];
        this.particles = [];
        this.blackholes = [];

        this.shipSpawn = 1000;
        this.shipSpawnMax = 10000;

        this.mans = [
            new Man(game, {rotation: Math.random() * Math.PI * 2, speed: Math.random() * 2 - 1}),
            new Man(game, {rotation: Math.random() * Math.PI * 2, speed: Math.random() * 2 - 1}),
            new Man(game, {rotation: Math.random() * Math.PI * 2, speed: Math.random() * 2 - 1}),
            new Man(game, {rotation: Math.random() * Math.PI * 2, speed: Math.random() * 2 - 1}),
        ];

        for(var i = 0; i < this.mans.length; i ++ ) {
            this.mans[i].addTo(this.mars);
        }

        // random angle

        //ships spawn in update!
        /*
        for(var i = 0; i < 0; i++) {
            var ship = new Ship(game, {
                distance: 350,//Math.random() * 150 + 250,
                rotation: Math.random() * Math.PI * 2,
                speed: Math.random() - 0.5
            });
            ship.addTo(this.mars);
            this.ships.push(ship);
        }
        */
        this.mars.addTo(this.scene2d);
    };

    PlayState.prototype.updateScore = function(dt) {
        this.scoreCounter += dt;
        if(this.scoreCounter > 1000) {
            this.score += Math.floor(this.scoreCounter/1000);
            this.scoreCounter = this.scoreCounter % 1000;
        }
        // attach properties like a jerk
        if( ( !this.scoreObject ) || (this.scoreObject && this.scoreObject.score != this.score ) ) {
            if(this.scoreObject) {
                this.scene2d.remove(this.scoreObject);
            }
            this.scoreObject = TextRenderer.render(this.font, "Score: " + this.score);
            this.scoreObject.score = this.score;
            this.scoreObject.position.x = 0; // this.cx*2;
            this.scoreObject.position.y = 0; // this.cy*2;
            this.scoreObject.position.z = 4;
            this.scene2d.add(this.scoreObject);
        }
    }

    PlayState.prototype.update = function(game, dt){
        State.prototype.update.call(this, game, dt);

        this.mars.atmosphere1.mesh.rotation.z -= dt/1000*0.05;
        this.mars.atmosphere2.mesh.rotation.z += dt/1000*0.05;
        this.updateScore(dt);

        var self = this;
        var rotation = 0;
        if( game.input.keys[87] ) {
            var blackhole = this.player.fire(game, this.mars);
            if( blackhole ) {
                this.blackholes.push(blackhole);
            }
        }

        //if(!this.player.firing) {
        var moving = false;
            if( game.input.keys[68] ) {
                rotation -= dt * Math.PI / 1600;
                var moving = true;
                this.player.direction(false);
            }
            if( game.input.keys[65] ) {
                rotation += dt * Math.PI / 1600;
                moving = true;
                this.player.direction(true);
            }
            this.player.setWalking(moving);

        //}
        this.mars.rotate(rotation);

        if(this.shakeTime >0){
            this.shakeTime-=dt;
            var dist = (this.shakeTime/1000) * 10;
            this.camera2d.position.x = Math.random() * dist - dist*0.5;
            this.camera2d.position.y = Math.random() * dist - dist*0.5;
        }else{
            this.camera2d.position.x = 0;
            this.camera2d.position.y = 0;
        }

        var self = this;

        this.shipSpawn-=dt;
        if(this.shipSpawn<=0){
            this.shipSpawn = this.shipSpawnMax;

            var ship = new Ship(game, {
                distance: Math.random() * 50 + 300,
                rotation: Math.random() * Math.PI * 2,
                speed: Math.random()*0.5 - 0.25
            });
            ship.addTo(this.mars);
            this.ships.push(ship);
        }

       // console.log(this.mans.length);
        if(this.mans.length < 5){
           var man =  new Man(game, {rotation: Math.random() * Math.PI * 2, speed: Math.random() * 2 - 1})
           man.addTo(this.mars);
           this.mans.push(man);
        }

        this.mans.forEach(function(man) {
            man.update(game, dt);
            if(! man.alive){
                self.mans.remove(man);
            }
        });

        this.ships.forEach(function(ship) {
            ship.update(dt, self.mars);

            if(ship.fireCounter > ship.fireCounterMax){
                ship.fire();
                self.missiles.push( new Missile( game, self.mars, ship.quad.mesh.rotation, ship.quad.mesh.position, ship.mouthSpot) );
            }

            if(!ship.alive){
                self.ships.remove(ship);
                self.particles.push(
                    new Particle(game, {
                        asset: 'particles/explode',
                        frames: 5,
                        planet: self.mars,
                        life:500,
                        position: { x: ship.quad.mesh.position.x, y: ship.quad.mesh.position.y, z: 10 }
                    })
                );
            }
        });

        // TODO Put this in missile.update
        for(var i = 0; i < this.blackholes.length; i ++ ) {
            var bh = this.blackholes[i];
            bh.update(game, dt);
            if(bh.closed) {
                this.blackholes.remove(bh)
            }
        }

        for(var i = 0; i < this.blackholes.length; i ++ ) {
            var bh = this.blackholes[i];
            for( var j = 0; j < this.missiles.length; j ++ ) {
                this.missiles[j].gravitize(bh, dt);
            }
        }

        this.missiles.forEach(function(missile) {

            //ghetto check vs planet!
            if(missile.quad.mesh.position.length() <= 105){
                missile.life = 0;
                self.shakeTime = 500;
                //did it hit a man?

                self.mans.forEach(function(man) {
                    var missileToMan = man.quad.mesh.position.clone();
                    missileToMan.sub(missile.quad.mesh.position);
                    if(missileToMan.length() < 64 ){

                        missileToMan.setLength(100 + Math.random()*50);

                        self.particles.push(
                            new Particle(game, {
                                asset: 'tinyman/die',
                                frames: 2,
                                planet: self.mars,
                                life:5000,
                                velX:missileToMan.x,
                                velY:missileToMan.y,
                                rotateSpeed:4.0,
                                position: { x: man.quad.mesh.position.x, y: man.quad.mesh.position.y, z: 10 }
                            })
                        );
                        man.die();
                        //TODO: spawn blood / man particle!
                    }
                });
            }

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
            }
            else {

                for(var i = 0; i < self.ships.length; i++ ) {
                    var ship = self.ships[i];
                    var shipToMissile = ship.quad.mesh.position.clone();
                    shipToMissile.sub(missile.quad.mesh.position);
                    if(shipToMissile.length() < 32 && missile.collideCooldown <=0 ){
                        self.score += 10;
                        missile.life = 0;
                        ship.die();
                    }
                }

                //collide with other missiles!!
                self.missiles.forEach(function(missile2) {
                   if(missile != missile2){
                        var missileToMissile = missile2.quad.mesh.position.clone();
                        missileToMissile.sub(missile.quad.mesh.position);
                        if(missileToMissile.length() < 16 ){
                            missile.life = 0;
                            missile2.life = 0;
                        }
                   }
                });

                if(missile.particleTimer > 150 ) {
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
                }

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
