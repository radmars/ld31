var PlayState = (function() {
    "use strict";

    var pixelize = function(t) {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.LinearMipMapLinearFilter;
    };

    function Mars(game) {
        this.bgSprite    = new TQuad(game, {animations: [{frames: ['assets/textures/bg/bg.png']}]});
        this.planet1      = new TQuad(game, {animations: [{frames: ['assets/textures/bg/mars.png']}]});
        this.planet2      = new TQuad(game, {animations: [{frames: ['assets/textures/bg/mars2.png']}]});
        this.planet3      = new TQuad(game, {animations: [{frames: ['assets/textures/bg/mars3.png']}]});
        this.planet4      = new TQuad(game, {animations: [{frames: ['assets/textures/bg/mars4.png']}]});
        this.planet5      = new TQuad(game, {animations: [{frames: ['assets/textures/bg/mars5.png']}]});

        this.planet = this.planet1;

        this.currentPlanetAsset = 0;

        this.atmosphere1 = new TQuad(game, {animations: [{frames: ['assets/textures/bg/mars_atmosphere1.png']}]});
        this.atmosphere2 = new TQuad(game, {animations: [{frames: ['assets/textures/bg/mars_atmosphere2.png']}]});
        this.glasses	 = new TQuad(game, {animations: [{frames: ['assets/intro/glasses1.png']}]});

        this.bgSprite.mesh.position.z    = -1;
        this.atmosphere1.mesh.position.z = 2;
        this.atmosphere2.mesh.position.z = 2;
        this.glasses.mesh.position.z = 3;
        this.glasses.mesh.position.y = -1;


        this.worldObject = new THREE.Object3D();
        this.add(this.bgSprite.mesh);
        this.add(this.atmosphere1.mesh);
        this.add(this.planet.mesh);
        this.add(this.atmosphere2.mesh);
        this.add(this.glasses.mesh);

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
                    frames: [
                        'assets/textures/enemies/' + this.enemyId + '/1.png',
                        'assets/textures/enemies/' + this.enemyId + '/3.png',
                    ],
                    frameTime: 100,
                    name: 'idle',
                },
                {
                    frames: [
                        'assets/textures/enemies/' + this.enemyId + '/2.png',
                    ],
                    frameTime: 2000,
                    name: 'fire',
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
        this.quad.update(dt);
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
        self.quad.setAnimation('fire', function() {
            self.firing = false;
            self.quad.setAnimation('idle');
        });
        this.firing = true;
    }

    Ship.prototype.die = function(){
        if(this.alive){
            this.alive = false;
            this.planet.remove(this.quad.mesh);
            game.loader.get("audio/ship-explode").play();
            game.state.shipsDestroyed++;
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
                name: 'assets/textures/bg/mars2.png',
                type: 'img',
                callback: pixelize,
            },
            {
                name: 'assets/textures/bg/mars3.png',
                type: 'img',
                callback: pixelize,
            },
            {
                name: 'assets/textures/bg/mars4.png',
                type: 'img',
                callback: pixelize,
            },
            {
                name: 'assets/textures/bg/mars5.png',
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
                name: 'assets/intro/glasses1.png',
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
         .concat(mapAnimationAssets(2, 'robot/hit'))
         .concat(mapAnimationAssets(2, 'tinyman/die'))
         .concat(mapAnimationAssets(1, 'tinyman/idle'))
         .concat(mapAnimationAssets(3, 'enemies/1'))
         .concat(mapAnimationAssets(3, 'enemies/2'))
         .concat(mapAnimationAssets(3, 'enemies/3'))
         .concat(mapAnimationAssets(2, 'tinyman/run'))
         .concat(mapAnimationAssets(20, 'robot/shoot'))
         .concat(mapAnimationAssets(3, 'blackhole/close'))
         .concat(mapAnimationAssets(3, 'blackhole/open'))
         .concat(mapAnimationAssets(4, 'blackhole/idle'))
         .concat(mapAnimationAssets(4, 'missile/trail'))
         .concat(mapAnimationAssets(4, 'robot/jump'))
         .concat(mapAnimationAssets(4, 'robot/walk'))
         .concat(mapAnimationAssets(5, 'particles/explode'))
         .concat(mapAnimationAssets(2, 'escapePod'))
         .concat(mapAnimationAssets(5, 'warp'))
         .concat(mapAnimationAssets(1, 'particles/planetChunks/1'))
         .concat(mapAnimationAssets(1, 'particles/planetChunks/2'))
         .concat(mapAnimationAssets(1, 'particles/planetChunks/3'))
         .concat(mapAnimationAssets(1, 'particles/planetChunks/4'))
         .concat(mapAnimationAssets(1, 'particles/planetChunks/5'))

         .concat(mapAnimationAssets(1, 'particles/debris/shipDebris1'))
         .concat(mapAnimationAssets(1, 'particles/debris/shipDebris2'))
         .concat(mapAnimationAssets(1, 'particles/debris/shipDebris3'))
         .concat(mapAnimationAssets(1, 'particles/debris/shipDebris4'))
         .concat(mapAnimationAssets(1, 'particles/debris/shipDebris5'))
         .concat(mapAnimationAssets(1, 'particles/debris/shipDebris6'))
         .concat(mapAnimationAssets(1, 'particles/debris/shipDebris7'))

         .concat(mapSoundAsset("ld31", 0.7))
         .concat(mapSoundAsset("blackhole", 0.75))
         .concat(mapSoundAsset("death"))
         .concat(mapSoundAsset("missile-explode"))
         .concat(mapSoundAsset("missile-fire"))
         .concat(mapSoundAsset("pod-explode"))
         .concat(mapSoundAsset("pod-launch", 0.9))
         .concat(mapSoundAsset("ship-explode"))
         .concat(mapSoundAsset("stun"))
         .concat(mapSoundAsset("warpin"))
         .concat(mapSoundAsset("pickup"))

         this.shipsDestroyed = 0;
         this.menSaved = 0;
         this.timeAlive = 0;
         this.menLost = 0;
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

        this.hp = 10;
        this.dieTimer = 4000;
        this.dieExplodeTimer = 0;
        this.dieing = false;
        this.planetRemoved = false;

        this.ships = [];
        this.missiles = [];
        this.particles = [];
        this.blackholes = [];
        this.escapePods = [];

        this.escapePodSpawn = this.escapePodSpawnMax = 2000;
        this.shipSpawn = 1000;
        this.shipSpawnMax = 15000;

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

        game.loader.get("audio/ld31").loop(true).play();
    };

    function addExplodeParticle( particles, mars, pos ) {
        particles.push(
            new Particle(game, {
                asset: 'particles/explode',
                frames: 5,
                planet: mars,
                life:500,
                position: pos
            })
        );
    };

    function addWarpParticle( particles, mars, pos, rotation ) {
        particles.push(
            new Particle(game, {
                asset: 'warp',
                frames: 5,
                planet: mars,
                life:500,
                position: pos,
                rotation: rotation
            })
        );
    };

    function addMissileTrailParticle( particles, mars, pos, rotation, offset ) {
        particles.push(
            new Particle(game, {
                asset: 'missile/trail',
                frames: 4,
                planet: mars,
                life:400,
                position: pos,
                offset:offset,
                rotation: rotation
            })
        );
    };

    function addTinyManParticle(particles, mars, pos, velX, velY){
        particles.push(
            new Particle(game, {
                asset: 'tinyman/die',
                frames: 2,
                planet: mars,
                life:5000,
                velX:velX,
                velY:velY,
                rotateSpeed:4.0,
                position: pos
            })
        );
    };

    function addPlanetDebris(particles, mars, pos, num){
        for(var i=0; i<num; i++){
            particles.push(
                new Particle(game, {
                    asset: 'particles/planetChunks/' + (Math.round(Math.random()*4+1)),
                    frames: 1,
                    planet: mars,
                    life:1500,
                    velX:Math.random()*200-100,
                    velY:Math.random()*200-100,
                    rotateSpeed:4.0,
                    position: pos
                })
            );
        }
    };

    function addShipDebris(particles, mars, pos, num){
        for(var i=0; i<num; i++){
            particles.push(
                new Particle(game, {
                    asset: 'particles/debris/shipDebris' + (Math.round(Math.random()*6+1)),
                    frames: 1,
                    planet: mars,
                    life:2000,
                    velX:Math.random()*200-100,
                    velY:Math.random()*200-100,
                    rotateSpeed:4.0,
                    position: pos
                })
            );
        }
    };

    PlayState.prototype.updateScore = function(dt) {
        this.scoreCounter += dt;
        if(this.scoreCounter > 1000) {
            this.timeAlive += Math.floor(this.scoreCounter/1000);
            this.scoreCounter = this.scoreCounter % 1000;
        }

        var score = this.calculateScore()
        // attach properties like a jerk
        if( ( !this.scoreObject ) || (this.scoreObject && this.scoreObject.score != score ) ) {
            if(this.scoreObject) {
                this.scene2d.remove(this.scoreObject);
            }
            this.scoreObject = TextRenderer.render(this.font, "Score: " + score );
            this.scoreObject.score = score;
            this.scoreObject.position.x = 0; // this.cx*2;
            this.scoreObject.position.y = 0; // this.cy*2;
            this.scoreObject.position.z = 4;
            this.scene2d.add(this.scoreObject);
        }
    }


    PlayState.prototype.goToScoreScreen = function() {
        var scores = {
            shipsDestroyed: this.shipsDestroyed,
            menSaved: this.menSaved,
            menLost: this.menLost,
            timeAlive: this.timeAlive,
            totalScore: this.calculateScore(),
        };
        game.operations.push(function() {
            game.setState( new GameOverState(scores) );
        });
    }

    PlayState.prototype.calculateScore = function() {
        return this.shipsDestroyed * 20
            + this.menSaved * 10
            + this.timeAlive
            - this.menLost * 15
    }

    PlayState.prototype.update = function(game, dt){
        State.prototype.update.call(this, game, dt);
        var self = this;
        this.mars.atmosphere1.mesh.rotation.z -= dt/1000*0.05;
        this.mars.atmosphere2.mesh.rotation.z += dt/1000*0.05;
        this.updateScore(dt);

        if( game.input.keys[78] || this.hp <= 0  ) {
            if (!this.dieing) {
                this.player.hit(4000);
            }
            this.dieing = true;
            this.shakeTime = 2000;
            //this.goToScoreScreen();
        }

        var currPlanetImage =  5-Math.round(this.hp*0.5);
        if(this.mars.currentPlanetAsset != currPlanetImage){
            console.log("CHANGING PLANET IMAGE: " + currPlanetImage);
            this.mars.currentPlanetAsset = currPlanetImage;
            this.mars.remove(this.mars.planet.mesh);
            switch(currPlanetImage){
                case 0:
                    this.mars.planet = this.mars.planet1;
                    break;
                case 1:
                    this.mars.planet = this.mars.planet2;
                    break;
                case 2:
                    this.mars.planet = this.mars.planet3;
                    break;
                case 3:
                    this.mars.planet = this.mars.planet4;
                    break;
                case 4:
                    this.mars.planet = this.mars.planet5;
                    break;
            }
            this.mars.add(this.mars.planet.mesh);

            for(var i=0; i<10; i++){
                var x = Math.random()*200-100;
                var y = Math.random()*200-100;
                addShipDebris(self.particles, self.mars, { x:x, y: y, z: 10 }, 1 );
                addPlanetDebris(self.particles, self.mars, { x:x, y: y, z: 10 }, 3 );
                addExplodeParticle(self.particles, self.mars, { x:x, y: y, z: 10 } );
            }
        }

        var self = this;
        var rotation = 0;

        if(this.dieing){
            this.dieTimer-=dt;

            this.dieExplodeTimer-=dt;
            if(this.dieExplodeTimer <= 0 && this.dieTimer > 2000){

                this.dieExplodeTimer = 100;
                var x = Math.random()*200-100;
                var y = Math.random()*200-100;
                addExplodeParticle(self.particles, self.mars, { x:x, y: y, z: 10 } );
                addPlanetDebris(self.particles, self.mars, { x:x, y: y, z: 10 }, 4 );
            }

            if(this.dieTimer < 2000 && ! this.planetRemoved ){
                this.planetRemoved = true;
                this.mars.remove(this.mars.atmosphere1.mesh);
                this.mars.remove(this.mars.atmosphere2.mesh);
                this.mars.remove(this.mars.planet.mesh);
                this.scene2d.remove(this.player.quad.mesh);

                for(var i=0; i<10; i++){
                    var x = Math.random()*200-100;
                    var y = Math.random()*200-100;
                    addShipDebris(self.particles, self.mars, { x:x, y: y, z: 10 }, 3 );
                    addExplodeParticle(self.particles, self.mars, { x:x, y: y, z: 10 } );
                }

                this.mans.forEach(function(man) {
                    var dist = man.quad.mesh.position.clone();
                    dist.setLength(100 + Math.random()*50);
                    addTinyManParticle(self.particles,self.mars, { x: man.quad.mesh.position.x, y: man.quad.mesh.position.y, z: 10 }, dist.x, dist.y );
                    man.die();
                });

                this.escapePods.forEach(function(pod) {
                    addShipDebris(self.particles, self.mars, { x: pod.quad.mesh.position.x, y: pod.quad.mesh.position.y, z: 10 }, 3 );
                    addExplodeParticle(self.particles, self.mars, { x: pod.quad.mesh.position.x, y: pod.quad.mesh.position.y, z: 10 } );
                    for(var i=0; i<pod.men; i++){
                        addTinyManParticle(self.particles,self.mars, { x: pod.quad.mesh.position.x, y: pod.quad.mesh.position.y, z: 10 }, Math.random()*200-100, Math.random()*200-100 );
                    }
                });
            }



            if(this.dieTimer <= 0){
                this.goToScoreScreen();
            }
        }

        if(this.player.hitTimer<= 0){
            if( game.input.keys[87] ) {
                var blackhole = this.player.fire(game, this.mars);
                if( blackhole ) {
                    this.blackholes.push(blackhole);
                    game.loader.get("audio/blackhole").play();
                }
            }

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
        }

        this.mars.rotate(rotation);

        this.escapePodSpawn-=dt;
        if(this.escapePodSpawn < 0 && !this.dieing){
            var pod = new EscapePod( game, this.mars, this.mars.planet.mesh.rotation, new THREE.Vector3(), new THREE.Vector3(0,125,0))
            this.escapePodSpawn = this.escapePodSpawnMax + pod.waitOnPlanet;
            this.escapePods.push( pod );
        }

        this.escapePods.forEach(function(pod) {

            var killed = false;
            self.mans.forEach(function(man) {
                var dist = man.quad.mesh.position.clone();
                dist.sub(pod.quad.mesh.position);

                if(dist.length() < 64 ){
                    game.loader.get("audio/pickup").play();
                    man.die();
                    pod.men++;
                }
            });

            self.ships.forEach(function(ship) {
                var dist = ship.quad.mesh.position.clone();
                dist.sub(pod.quad.mesh.position);
                if( dist.length() < 32  ){
                    ship.life = 0;
                    ship.die();
                    pod.life = 0;
                    killed = true;
                }
            });

            self.missiles.forEach(function(missile) {
                var dist = missile.quad.mesh.position.clone();
                dist.sub(pod.quad.mesh.position);
                if( dist.length() < 32  ){
                    missile.life = 0;
                    pod.life = 0;
                    killed = true;
                }
            });

            pod.update(game, dt);

            if(pod.particleTimer > 150 && pod.waitOnPlanet <= 0) {
                pod.particleTimer = 0;
                addMissileTrailParticle(self.particles, self.mars, { x: pod.quad.mesh.position.x, y: pod.quad.mesh.position.y, z: 10 }, pod.rotation, {x:-5,y:40} );
                addMissileTrailParticle(self.particles, self.mars, { x: pod.quad.mesh.position.x, y: pod.quad.mesh.position.y, z: 10 }, pod.rotation, {x:5,y:40} );
            }

            if(! pod.alive){
                self.escapePods.remove(pod);
                if(killed){
                    self.shakeTime = 500;
                    game.loader.get("audio/pod-explode").play();
                    game.loader.get("audio/death").play();
                    addShipDebris(self.particles, self.mars, { x: pod.quad.mesh.position.x, y: pod.quad.mesh.position.y, z: 10 }, 3 );
                    addExplodeParticle(self.particles, self.mars, { x: pod.quad.mesh.position.x, y: pod.quad.mesh.position.y, z: 10 } );
                    for(var i=0; i<pod.men; i++){
                        addTinyManParticle(self.particles,self.mars, { x: pod.quad.mesh.position.x, y: pod.quad.mesh.position.y, z: 10 }, Math.random()*200-100, Math.random()*200-100 );
                    }
                    self.menLost += pod.men;
                }
                else {
                    self.menSaved += pod.men;
                }
            }
        });

        if(this.shakeTime >0){
            this.shakeTime-=dt;
            var dist = (this.shakeTime/1000) * 10;
            this.camera2d.position.x = Math.random() * dist - dist*0.5;
            this.camera2d.position.y = Math.random() * dist - dist*0.5;
        }else{
            this.camera2d.position.x = 0;
            this.camera2d.position.y = 0;
        }


        this.shipSpawn-=dt;
        if(this.shipSpawn<=0){
            this.shipSpawn = this.shipSpawnMax;
            this.shipSpawnMax*=0.95;
            if(this.shipSpawnMax < 5000){
                this.shipSpawnMax = 2000;
            }
            var rot = Math.random() * Math.PI * 2;
            var speed = Math.random()*0.5 - 0.25
            var ship = new Ship(game, {
                distance: Math.random() * 50 + 300,
                rotation: rot,
                speed:speed
            });

            if(speed > 0){
               rot -= Math.PI*0.5;
            }else{
               rot += Math.PI*0.5;
            }
            addWarpParticle(self.particles, self.mars, { x: ship.quad.mesh.position.x, y: ship.quad.mesh.position.y, z: 10 }, rot );
            ship.addTo(this.mars);
            this.ships.push(ship);

            game.loader.get("audio/warpin").play();
        }

        if(this.mans.length < 5&& !this.dieing){
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
                game.loader.get("audio/missile-fire").play();
            }

            if(!ship.alive){
                self.ships.remove(ship);
                addExplodeParticle(self.particles, self.mars, { x: ship.quad.mesh.position.x, y: ship.quad.mesh.position.y, z: 10 } );
                addShipDebris(self.particles, self.mars, { x: ship.quad.mesh.position.x, y: ship.quad.mesh.position.y, z: 10 }, 3 );
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
            for( var k = 0; k < this.escapePods.length; k ++ ) {
                this.escapePods[k].gravitize(bh, dt);
            }
        }

        this.missiles.forEach(function(missile) {

            //ghetto check vs planet!
            if(missile.quad.mesh.position.length() <= 105){
                missile.life = 0;
                self.shakeTime = 500;
                game.loader.get("audio/missile-explode").play();
                self.hp--;
                //did it hit a man?
                addPlanetDebris(self.particles, self.mars, { x: missile.quad.mesh.position.x, y: missile.quad.mesh.position.y, z: 10 }, 4 );
                var hitMan = false;

                self.mans.forEach(function(man) {
                    var dist = man.quad.mesh.position.clone();
                    dist.sub(missile.quad.mesh.position);
                    if(dist.length() < 64 ){

                        dist.setLength(100 + Math.random()*50);

                        addTinyManParticle(self.particles,self.mars, { x: man.quad.mesh.position.x, y: man.quad.mesh.position.y, z: 10 }, dist.x, dist.y );

                        man.die();
                        self.menLost ++;
                        hitMan = true;
                        //TODO: spawn blood / man particle!
                    }
                });

                if (hitMan) {
                    game.loader.get("audio/death").play();
                }
            }

            missile.update(game, dt);

            if(!missile.alive){
                self.missiles.remove(missile);
                addExplodeParticle(self.particles, self.mars, { x: missile.quad.mesh.position.x, y: missile.quad.mesh.position.y, z: 10 } );
            }
            else {

                //vs player
                var rotation = self.mars.rotation + Math.PI / 2;
                var dist = new THREE.Vector2( Math.cos(rotation), Math.sin(rotation) );
                dist.y *= -1;
                dist.multiplyScalar( 120 );

                dist.sub(missile.quad.mesh.position);
                if(dist.length() < 32 ){
                    self.player.hit();
                    missile.life = 0;
                    game.loader.get("audio/missile-explode").play();
                }

                for(var i = 0; i < self.ships.length; i++ ) {
                    var ship = self.ships[i];
                    var shipToMissile = ship.quad.mesh.position.clone();
                    shipToMissile.sub(missile.quad.mesh.position);
                    if(shipToMissile.length() < 32 && missile.collideCooldown <=0 ){
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
                            game.loader.get("audio/missile-explode").play();
                            missile.life = 0;
                            missile2.life = 0;
                        }
                   }
                });

                if(missile.particleTimer > 150 ) {
                    missile.particleTimer = 0;
                    addMissileTrailParticle(self.particles, self.mars, { x: missile.quad.mesh.position.x, y: missile.quad.mesh.position.y, z: 10 }, missile.rotation, {x:0,y:-10} );
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
        game.renderer.autoClear = true;
    };

    PlayState.prototype.render = function(game) {
        game.renderer.clear();
        game.renderer.render(this.scene2d, this.camera2d);
    };

    return PlayState;
}).call(this);
