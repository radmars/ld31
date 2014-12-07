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
        this.startPosition = { x: position.x, y: position.y };
        this.quad.mesh.rotation.z = rotation.z
        this.quad.mesh.position.x = position.x + offset.x;
        this.quad.mesh.position.y = position.y + offset.y;
        this.quad.mesh.position.z = 4;
        this.planet = planet;
        this.planet.add(this.quad.mesh);

        this.particleTimer = 0;
        this.calculatePosition();
    }

    // more trig,  or something.
    Missile.prototype.calculatePosition = function() {
        var n = this.quad.mesh.position.clone();
        n.z = 0;
        this.quad.mesh.position.y = this.startPosition.y * (1 - this.counter / 3000);
        this.quad.mesh.position.x = this.startPosition.x * (1 - this.counter / 3000);
    }

    Missile.prototype.gravitize = function( blackhole ) {

    }

    Missile.prototype.update = function(game, dt) {
        this.counter += dt;
        this.trailCounter += dt;
        this.particleTimer += dt;
        if( this.counter < 3000 ) {
            this.calculatePosition();

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

