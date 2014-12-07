var Man = (function() {
    "use strict";
    function Man(game, options) {
        this.quad = new TQuad(game, {
            animations: [
                { name: 'idle', frames: TQuad.enumerate(1, "tinyman/idle"), frameTime: 100 },
                { name: 'run',  frames: TQuad.enumerate(2, "tinyman/run"),  frameTime: 100 },
                { name: 'die',  frames: TQuad.enumerate(1, "tinyman/die"),  frameTime: 100 },
            ],
            current: 'run',
        });

        this.speed = options.speed || Math.PI / 5;
        this.rotate(options.rotation || 0);
    }

    Man.prototype.rotate = function(rotation) {
        this.rotation = rotation;
        this.quad.mesh.rotation.z = Math.PI/2 + this.rotation;
        this.quad.mesh.position.set(
            Math.cos(this.rotation),
            Math.sin(this.rotation),
            0
        );
        this.quad.mesh.position.multiplyScalar( 118 );
    }

    Man.prototype.update = function(game, dt) {
        this.quad.update(dt);
        this.direction(this.speed < 0);
        this.rotate( this.rotation += dt * this.speed / 1000 );
    }

    Man.prototype.addTo = function(container){
        this.container = container;
        container.add(this.quad.mesh);
    }

    Man.prototype.direction = function(right) {
        if( right ) {
            this.quad.mesh.scale.x = -Math.abs(this.quad.mesh.scale.x);
        }
        else {
            this.quad.mesh.scale.x = Math.abs(this.quad.mesh.scale.x);
        }
    }

    return Man;
}());
