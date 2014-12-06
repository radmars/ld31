var PlayState = (function() {

    function PlayState() {
        State.call(this);
        this.assets = [
            {
                name: 'assets/models/bomb.js',
                type: 'model'
            }
        ];
    };

    PlayState.prototype = Object.create(State.prototype);

    PlayState.prototype.getAssets = function() {
        return this.assets;
    };

    PlayState.prototype.onStart = function(game) {
        var self = this;
        this.game = game;
        this.scene2d = new THREE.Scene();
        this.camera2d = new THREE.OrthographicCamera(0, game.width, game.height );
        game.renderer.setClearColor(0x2e2e2e, 1);
        game.renderer.autoClear = false;
        this.camera2d.position.z = 100;

        plane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshNormalMaterial());
        //plane.rotateOnAxis(new THREE.Vector3(-1, 0, 0), 90);
        this.scene2d.add(plane);
    };

    PlayState.prototype.resize = function(width, height) {
        this.camera2d.right = width;
        this.camera2d.bottom = height;
        this.camera2d.updateProjectionMatrix();
    };

    PlayState.prototype.onStop = function(game) {
        game.renderer.autoClear = true;
    };

    PlayState.prototype.render = function(game) {
        game.renderer.clear();
        game.renderer.render(this.scene2d, this.camera2d);
    };

    return PlayState;
}).call(this);
