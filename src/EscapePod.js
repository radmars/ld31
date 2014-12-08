var EscapePod = (function() {
    "use strict";
    function EscapePod(game, planet, rotation, position, offset) {
        this.quad = new TQuad(game, {
            animations: [
                {
                    frames: [ 'assets/textures/escapePod/1.png', 'assets/textures/escapePod/2.png' ],
                },
            ],
        });

        this.rotation = rotation.z;
        offset = rotateV( new THREE.Vector3( offset.x, offset.y ), this.rotation );

        this.alive = true;
        this.life = 10000;
        this.waitOnPlanet = 5000;
        //collideCooldown prevents collision until X ms
        this.men = 1;
        this.trailCounter = 0;

        this.counter = 0;
        this.quad.mesh.rotation.z = rotation.z
        this.quad.mesh.position.x = position.x + offset.x;
        this.quad.mesh.position.y = position.y + offset.y;
        this.quad.mesh.position.z = 0;
        this.planet = planet;
        this.planet.add(this.quad.mesh);

        this.planetPos = new THREE.Vector3( 0, 0, 0);

        this.speed = 100;
        this.vel = this.quad.mesh.position.clone();
        this.vel = this.vel.sub(this.planetPos);
        this.vel.setLength(this.speed);
        //console.log(this.vel);

        this.particleTimer = 0;

        this.launched = false;
    }

    EscapePod.prototype.gravitize = function( blackhole, dt ) {
        if(this.waitOnPlanet > 0){
            return;
        }

        var pos = this.quad.mesh.position;
        var toHole = pos.clone();
        toHole.sub(blackhole.quad.mesh.position);
        //console.log(toHole.length());
        var dist = toHole.length();
        var m = 1- (dist/150);

        if(dist <150){
            this.vel.x -= toHole.x*dt/1000 * m* m * 5;
            this.vel.y -= toHole.y*dt/1000 * m* m * 5;
        }
    }

    EscapePod.prototype.update = function(game, dt) {
        this.counter += dt;
        this.trailCounter += dt;
        this.particleTimer += dt;
        var pos = this.quad.mesh.position;

        this.life -=dt;

        if(this.vel.length() < this.speed){
            this.vel.setLength(this.speed);
        }

        this.quad.mesh.rotation.z = this.rotation= Math.atan2(this.vel.y, this.vel.x) + Math.PI*0.5;

        if(this.waitOnPlanet > 0){
            this.waitOnPlanet-=dt;
        }else{
            pos.x += this.vel.x * dt/1000;
            pos.y += this.vel.y * dt/1000;

            if (!this.launched) {
                this.launched = true;
                game.loader.get("audio/pod-launch").play();
            }
        }

        if(this.alive && this.life <= 0){
            this.alive = false;
            this.planet.remove(this.quad.mesh);
        }

    }
    return EscapePod;
}());

