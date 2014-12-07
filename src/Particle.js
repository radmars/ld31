var Particle = (function() {
    "use strict";

    function Particle(game, options) {
        var asset    = options.asset;
        var frames   = options.frames;
        var planet   = options.planet;
        var rotation = options.planet;
        var position = options.position;
        var offset   = options.offset || { x: 0, y: 0 };

                    console.log( TQuad.enumerate( frames, asset ) );
        this.quad = new TQuad(game, {
            animations: [
                {
                    frames: TQuad.enumerate( frames, asset ),
                    frameTime: 100
                },
            ],
        });


        this.rotation = rotation.z;
        offset = rotateV( new THREE.Vector3( offset.x, offset.y ), this.rotation );

        this.vel = new THREE.Vector3( 0, 0, 0);
        this.life = 1000;

        this.quad.mesh.rotation.z = rotation.z;
        this.quad.mesh.position.x = position.x + offset.x;
        this.quad.mesh.position.y = position.y + offset.y;
        this.quad.mesh.position.z = 4;
        this.planet = planet;
        var self = this;

    console.log(game.state);
        game.operations.push(function(){
            self.planet.add(self.quad.mesh);
            self.cb = self.update.bind(self);
            game.state.controllers.push(self.cb);
        });
    }

    Particle.prototype.update = function(game, dt) {
        this.life -= dt;
        this.quad.update(dt);
        console.log("Updating??");
        if( this.life <  0) {
            console.log( "Removing" );
            this.planet.remove(this.mesh);
            game.state.controllers.remove(this.cb);
        }
    };

    return Particle;
}());
