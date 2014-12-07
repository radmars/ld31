var TQuad = (function() {
    // A textured quad.
    function TQuad(game, fname) {
        this.material = new THREE.MeshBasicMaterial({
            map: game.loader.get( fname ),
            color: 0xffffff,
            transparent: true,
            // In order to support flipping need two sides...
            side: THREE.DoubleSide
        });

        this.width = this.material.map.image.width;
        this.height = this.material.map.image.height;


        var scale = 2;
        this.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ), this.material );
        this.mesh.scale.set(
            this.material.map.image.width * scale,
            -this.material.map.image.height * scale,
            1
        );
    }

    return TQuad;
}());
