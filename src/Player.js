var Player = (function() {
    "use strict;"

    function Blackhole(game, planet) {
        this.quad = new TQuad(game, {
            animations: [
                {
                    frames: TQuad.enumerate( 4, 'blackhole/idle' ),
                    frameTime: 100,
                    name: 'idle',
                },
                {
                    frames: TQuad.enumerate( 3, 'blackhole/open' ),
                    frameTime: 100,
                    name: 'open',
                },
            ],
            current: 'open',
        });

        this.counter = 0;
        this.quad.mesh.position.z = 0;
        this.planet = planet;
        // Pin our rotation.
        this.rotation = planet.rotation;
        this.planet.add(this.quad.mesh);
        this.calculatePosition();
    }

    // more trig,  or something.
    Blackhole.prototype.calculatePosition = function() {
        var converted = new THREE.Vector3(0, -140 - (this.counter / 1000) * 150);
        var m = new THREE.Matrix4().makeRotationZ(-this.rotation);
        converted.applyMatrix4(m);

        this.quad.mesh.rotation.z = - this.rotation;
        this.quad.mesh.position.y = converted.y;
        this.quad.mesh.position.x = converted.x;
    }

    Blackhole.prototype.update = function(game, dt) {
        this.quad.update(dt);
        this.counter += dt;
        if( this.counter < 1000 ) {
            this.calculatePosition();
        }
        else if( this.counter < 3000 ) {
            if( !this.opened ) {
                this.quad.currentAnimation = 'idle'
                this.quad.setFrame(0)
                this.opened = true;
            }
        }
        else {
            this.planet.remove(this.quad.mesh);
            this.closed = true;
        }
    }

    function Player(game, options){
        this.quad = new TQuad(game, {
            animations: [
                {
                    name: 'idle',
                    frames: TQuad.enumerate(1, "robot/idle"),
                    frameTime: 100
                },
            ],
        });
    }

    Player.prototype.addTo = function(container){
        this.container = container;
        container.add(this.quad.mesh);
    }

    Player.prototype.update = function(game, dt) {
        var self = this;
        this.quad.mesh.position.set(
            game.width / 2,
            game.height / 2 - 128,
            -1
        );

        if(this.blackhole) {
            this.blackhole.update(game, dt);

            if(this.blackhole.closed) {
                this.blackhole = null;
            }
        }
    }

    Player.prototype.direction = function(right) {
        if( right ) {
            this.quad.mesh.scale.x = -Math.abs(this.quad.mesh.scale.x);
        }
        else {
            this.quad.mesh.scale.x = Math.abs(this.quad.mesh.scale.x);
        }
    }

    Player.prototype.fire = function(game, planet) {
        if(!this.blackhole) {
            this.blackhole = new Blackhole(game, planet);
        }
    }

    return Player;
}());
