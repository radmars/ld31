var Player = (function() {
    "use strict";

    function Blackhole(game, planet) {
        this.quad = new TQuad(game, {
            animations: [
                {
                    frames: TQuad.enumerate( 4, 'blackhole/idle' ),
                    frameTime: 100,
                    name: 'idle',
                },
                {
                    frames: TQuad.enumerate( 3, 'blackhole/close' ),
                    frameTime: 100,
                    name: 'close',
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
        this.planet = planet;
        // Pin our rotation.
        this.rotation = planet.rotation + Math.PI / 2;
        this.planet.add(this.quad.mesh);
        this.direction = new THREE.Vector2( Math.cos(this.rotation), Math.sin(this.rotation) );
        this.direction.y *= -1;
        var pos = this.direction.clone();
        this.direction.multiplyScalar( 100 );
        pos.multiplyScalar( 180 );
        this.quad.mesh.position.x = pos.x;
        this.quad.mesh.position.y = pos.y;
        this.quad.mesh.position.z = 0;
        this.quad.mesh.rotation.z = - this.rotation;
        this.calculatePosition(0);
    }

    Blackhole.prototype.calculatePosition = function(dt ) {
        this.quad.mesh.position.x += this.direction.x * dt / 1000
        this.quad.mesh.position.y += this.direction.y * dt / 1000
    }

    Blackhole.prototype.update = function(game, dt) {
        this.quad.update(dt);
        this.counter += dt;
        if( this.counter < 1000 ) {
            this.calculatePosition(dt);
        }
        else if( this.counter < 3000 ) {
            if( !this.opened ) {
                this.quad.setAnimation('idle');
                this.quad.setFrame(0)
                this.opened = true;
            }
        }
        else if( this.counter < 4000 ) {
            if( ! this.closing) {
                this.closing = true;
                this.quad.setAnimation('close');
                this.quad.setFrame(0);
            }
        }
        else {
                this.closed = true;
            this.planet.remove(this.quad.mesh);
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
                {
                    name: 'shoot',
                    frames: TQuad.enumerate(20, "robot/shoot"),
                    frameTime: 33
                },

            ],
        });

        this.blackholeTimer = 0;
        this.quad.mesh.position.set(
            game.width / 2,
            game.height / 2 - 128,
            -1
        );

    }

    Player.prototype.addTo = function(container){
        this.container = container;
        container.add(this.quad.mesh);
    }

    Player.prototype.update = function(game, dt) {
        this.quad.update(dt);
        this.blackholeTimer += dt;
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
        if(this.blackholeTimer > 1000) {
            this.blackholeTimer = 0;
            this.firing = true;

            var self = this;
            this.quad.setAnimation( 'shoot', function() {
                self.firing = false;
                self.quad.setAnimation('idle');
            });

            return new Blackhole(game, planet);
        }
    }

    return Player;
}());
