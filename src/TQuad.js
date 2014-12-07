var TQuad = (function() {
    "use strict;"

    // magic number makes the game look good.
    var scale = 2;

    // A textured quad.
    function TQuad(game, options) {
        this.materials = options.frames.map(function(file) {
            return new THREE.MeshBasicMaterial({
                map: game.loader.get( file ),
                color: 0xffffff,
                transparent: true,
                // In order to support flipping need two sides...
                side: THREE.DoubleSide
            });
        });

        this.width = this.materials[0].map.image.width;
        this.height = this.materials[0].map.image.height;

        this.timer = 0;
        this.frameTime = options.frameTime;
        this.currentFrame = 0;

        this.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ), this.materials[0] );
        this.mesh.scale.set(
            this.width * scale,
            -this.height * scale,
            1
        );
    }

    TQuad.enumerate = function( count, name ) {
        var assets = [];
        for(var i = 1; i <= count; i ++ ) {
            assets.push('assets/textures/' + name + '/' + i + '.png');
        }
        return assets;
    }

    TQuad.prototype.update = function( dt ) {
        this.timer += dt;
        if( this.timer > this.frameTime ) {
            this.timer = 0;
            this.currentFrame ++;
            this.currentFrame = this.currentFrame % this.materials.length;
            this.mesh.material = this.materials[this.currentFrame];
        }
    }

    TQuad.prototype.setFrame = function( f ) {
        this.currentFrame = f;
        this.mesh.material = this.materials[this.currentFrame];
    }

    return TQuad;
}());
