var EscapePod = (function() {
    "use strict";
    function EscapePod(game, planet, rotation, position ) {
        this.quad = new TQuad(game, {
            animations: [
                {
                    frames: [
                        'assets/textures/escapePod/1.png',
                        'assets/textures/escapePod/2.png'
                    ],
                },
            ],
        });

        this.rotation = rotation.z;
        this.finalPosition = rotateV( new THREE.Vector3( position.x, position.y ), this.rotation );
        var direction = this.finalPosition.clone();
        direction.normalize();

        this.alive = true;
        this.life = 9000;
        this.waitOnPlanet = 5000;
        //collideCooldown prevents collision until X ms
        this.men = 1;
        this.trailCounter = 0;

        this.counter = 0;
        this.startPosition = this.finalPosition.clone().sub( direction.multiplyScalar( this.quad.height + 10 ) );
        this.quad.mesh.position.x = this.startPosition.x;
        this.quad.mesh.position.y = this.startPosition.y;
        this.quad.mesh.rotation.z = rotation.z;
        this.quad.mesh.position.z = 0;
        this.planet = planet;
        this.planet.add(this.quad.mesh);

        this.planetPos = new THREE.Vector3( 0, 0, 0);

        this.speed = 100;
        this.vel = this.quad.mesh.position.clone();
        this.vel = this.vel.sub(this.planetPos);
        this.vel.setLength(this.speed);

        this.particleTimer = 0;
        this.raiseTime = 800;
        this.raiseCounter = 0;

        this.launched = false;
    }

    EscapePod.prototype.gravitize = function( blackhole, dt ) {
        if(this.waitOnPlanet > 0){
            return;
        }

        var pos = this.quad.mesh.position;
        var toHole = pos.clone();
        toHole.sub(blackhole.quad.mesh.position);
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

        if(!this.raised) {
            this.raiseCounter += dt;
            if(this.raiseCounter > this.raiseTime) {
                this.raised = true;
            }
            var diff = this.finalPosition.clone().sub( this.startPosition );
            diff.multiplyScalar( this.raiseCounter / this.raiseTime ).add(this.startPosition);
            this.quad.mesh.position.x = diff.x;
            this.quad.mesh.position.y = diff.y;
        }

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

