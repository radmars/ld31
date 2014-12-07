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
        this.life = 10000;
        //collideCooldown prevents collision until X ms
        this.collideCooldown = 1000;
        this.trailCounter = 0;



        this.counter = 0;
        this.quad.mesh.rotation.z = rotation.z
        this.quad.mesh.position.x = position.x + offset.x;
        this.quad.mesh.position.y = position.y + offset.y;
        this.quad.mesh.position.z = 4;
        this.planet = planet;
        this.planet.add(this.quad.mesh);

        this.planetPos = new THREE.Vector3( 0, 0, 0);

        this.speed = 50;
        this.vel = this.quad.mesh.position.clone();
        this.vel = this.vel.sub(this.planetPos);
        this.vel.setLength(this.speed*-1);
        //console.log(this.vel);

        this.particleTimer = 0;
    }

    Missile.prototype.gravitize = function( blackhole, dt ) {
        var pos = this.quad.mesh.position;
        var toHole = pos.clone();
        toHole.sub(blackhole.quad.mesh.position);
        //console.log(toHole.length());
        var dist = toHole.length();
        var m = 1- (dist/100);

        if(dist <100){
            this.vel.x -= toHole.x*dt/1000 * m* m * 10;
            this.vel.y -= toHole.y*dt/1000 * m* m * 10;
        }
    }

    Missile.prototype.update = function(game, dt) {
        this.counter += dt;
        this.trailCounter += dt;
        this.particleTimer += dt;
        var pos = this.quad.mesh.position;

        this.life -=dt;

        if(this.collideCooldown > 0){
            this.collideCooldown-=dt;
        }

        if(this.vel.length() < this.speed){
            this.vel.setLength(this.speed);
        }

        this.quad.mesh.rotation.z = Math.atan2(this.vel.y, this.vel.x) - Math.PI*0.5;
        pos.x += this.vel.x * dt/1000;
        pos.y += this.vel.y * dt/1000;

        //ghetto check vs planet!
        if(pos.length() <= 105){
            this.life = 0;
        }

        if(this.alive && this.life <= 0){
            this.alive = false;
            this.planet.remove(this.quad.mesh);
        }

    }
    return Missile;
}());

