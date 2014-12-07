var Player = (function() {
    "use strict;"

    function Blackhole(game, planet) {
        this.quad = new TQuad(game, 'assets/textures/tinyman/die/1.png')
        this.counter = 0;
        this.quad.mesh.position.z = 3;
        this.planet = planet;
        // Pin our rotation.
        this.rotation = planet.rotation;
        planet.add(this.quad.mesh);
        this.calculatePosition();
    }

    // more trig,  or something.
    Blackhole.prototype.calculatePosition = function() {
        var converted = new THREE.Vector3(0, -140 - this.counter / 10 );
        var m = new THREE.Matrix4().makeRotationZ(-this.rotation);
        converted.applyMatrix4(m);

        this.quad.mesh.rotation.z = this.rotation;
        this.quad.mesh.position.y = converted.y;
        this.quad.mesh.position.x = converted.x;
    }

    Blackhole.prototype.update = function(game, dt) {
        if( this.counter < 1000 ) {
            this.counter += dt;
            this.calculatePosition();
        }
        else {
            return false;
        }
        return true;
    }

    function Player(game, options){
        this.quad = new TQuad(game, 'assets/textures/robot/idle/1.png');
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
            if( ! this.blackhole.update(game, dt) ) {
                var bh = this.blackhole;
                this.blackhole = null;
                window.setTimeout(function() {
                    bh.planet.remove(bh.quad.mesh);
                }, 2000);
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
