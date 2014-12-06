var PlayState = (function() {

    function Circle() {
        State.call(this);
        this.assets = [
            {
                name: 'assets/models/bomb.js',
                type: 'model'
            }
        ];
    };

    Circle.prototype = Object.create(State.prototype);

    Circle.prototype.getAssets = function() {
        return this.assets;
    };

    Circle.prototype.onStart = function(game) {
        var self = this;
        this.game = game;
        this.scene2d = new THREE.Scene();
        this.camera2d = new THREE.OrthographicCamera(0, window.innerWidth, 0, window.innerHeight);
        game.renderer.setClearColor(0x2e2e2e, 1);
        game.renderer.autoClear = false;
        this.camera2d.position.z = 100;

        plane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshNormalMaterial());
        //plane.rotateOnAxis(new THREE.Vector3(-1, 0, 0), 90);
        this.scene2d.add(plane);
    };

    Circle.prototype.resize = function(width, height) {
        this.camera2d.right = width;
        this.camera2d.bottom = height;
        this.camera2d.updateProjectionMatrix();
    };

    Circle.prototype.onStop = function(game) {
        game.renderer.autoClear = true;
    };

    Circle.prototype.render = function(game) {
        console.log("Renderin");
        game.renderer.clear();
        game.renderer.render(this.scene2d, this.camera2d);
    };

    return Circle;
}).call(this);
