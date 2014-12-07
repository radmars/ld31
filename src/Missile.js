var Missile = (function() {
    "use strict";
    function Missile(game, planet, rotation, position, offset) {
        this.quad = new TQuad(game, {
            animations: [
                {
                    frames: [ 'assets/textures/missile/missile.png' ],
                },
            ],
        });

        this.rotation = rotation.z;
        offset = rotateV( new THREE.Vector3( offset.x, offset.y ), this.rotation );

        this.alive = true;
        this.trailCounter = 0;
        this.counter = 0;
        this.quad.mesh.rotation.z = rotation.z
        this.quad.mesh.position.x = position.x + offset.x;
        this.quad.mesh.position.y = position.y + offset.y;
        this.quad.mesh.position.z = 4;
        this.planet = planet;
        this.planet.add(this.quad.mesh);

        this.particleTimer = 0;
    }

    // more trig,  or something.
    Missile.prototype.fall = function(dt) {
        var n = this.quad.mesh.position.clone();
        n.z = 0;
        n.normalize();
        this.quad.mesh.position.y -= dt / 100 * n.y;
        this.quad.mesh.position.x -= dt / 100 * n.x;
    }

    Missile.prototype.gravitize = function( blackhole, dt ) {
        var pos = this.quad.mesh.position;
        var dir = pos.clone();
        var pull = blackhole.quad.mesh.position.clone();
        pull.z = pos.z;
        var distance = pos.distanceTo(pull);
        if( distance < 100 ) {
            dir.sub(pull);
            dir.normalize();
            pos.x -= dir.x * distance * dt / 1000;
            pos.y -= dir.y * distance * dt / 1000;
            if( distance < 25 ) {
                // TODO: add explosions here.
                this.alive = false;
                this.planet.remove(this.quad.mesh);
            }
        }
    }

    Missile.prototype.update = function(game, dt) {
        this.counter += dt;
        this.trailCounter += dt;
        this.particleTimer += dt;
        var pos = this.quad.mesh.position;

        // planet surface is roughly 100px sigh
        // TODO scalign???!?!
        if( pos.distanceTo(new THREE.Vector3( 0, 0, pos.z ) ) > 100 ) {
            this.fall(dt);

            if(this.particleTimer > 1000 && Math.random() > .99) {
                this.particleTimer = 0;
                new Particle(game, {
                    asset: 'missile/trail',
                    frames: 4,
                    planet: this.planet,
                    position: { x: 0, y: 0, z: 5 },
                    //rotation: this.quad.mesh.rotation,
                    //position: this.quad.mesh.position,
                    //offset: { y: -8, x: 0 },
                });
            }
        }
        else {
            if(this.alive){
                this.alive = false;
                this.planet.remove(this.quad.mesh);
            }
        }
    }
    return Missile;
}());

