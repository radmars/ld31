var GameOverState = (function() {
    "use strict";

    var pixelize = function(t) {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.LinearMipMapLinearFilter;
    };

    function GameOverState(scores) {
        State.call(this);
        this.assets = [
        ];
        this.shipsDestroyed = scores.shipsDestroyed;
        this.menSaved = scores.menSaved;
        this.menLost = scores.menLost;
        this.timeAlive = scores.timeAlive;
        this.totalScore = scores.totalScore;

    };

    GameOverState.prototype = Object.create(State.prototype);

    GameOverState.prototype.getAssets = function() { return this.assets; };

    GameOverState.prototype.onStart = function(game) {
        this.score = 0;

        this.scene2d = new THREE.Scene();
        this.camera2d = new THREE.OrthographicCamera( 0, game.width, 0, game.height );
        this.camera2d.position.z = 10;
        game.renderer.setClearColor(0x2e2e2e, 1);
        game.renderer.autoClear = false;
        
        this.font = new TextRenderer.Font({
            font: "monospace",
            size: 56,
            fgColor: 'white',
        });
        var self = this;

		this.bgSprite    = new TQuad(game, {animations: [{frames: ['assets/textures/bg/bg.png']}]});
		this.scoreSprite    = new TQuad(game, {animations: [{frames: ['assets/textures/ui/scores.png']}]});
			
 		this.bgSprite.mesh.position.z    = -1;
 		this.scoreSprite.mesh.position.x = -150;
				
		this.worldObject = new THREE.Object3D();
        this.worldObject.add(this.bgSprite.mesh);
        this.worldObject.add(this.scoreSprite.mesh);
        this.worldObject.position.set( game.width / 2, game.height / 2, 0 );
		this.scene2d.add(this.worldObject);
		
        [
            " " + this.menSaved + " (" + this.menSaved*15 + ")",
            " " + this.menLost + " (-" + this.menLost*5 + ")",
            " " + this.shipsDestroyed + " (" + this.shipsDestroyed*25 + ")",
            " " + this.timeAlive + " (" + this.timeAlive + ")",
            " " + this.totalScore,

        ].forEach(function(measure,i ) {
            var scoreObject = TextRenderer.render(self.font, measure);       
            scoreObject.position.x = game.width/2 + 70;
            scoreObject.position.y = (game.height/2 - 225) + i * 82;
            if ( i==4 ) scoreObject.position.y = (game.height/2 - 229) + (i+1)*82;
            scoreObject.position.z = 4;
            self.scene2d.add(scoreObject);
        });
    };

    GameOverState.prototype.update = function(game, dt){
        State.prototype.update.call(this, game, dt);
        if( game.input.keys[13] ) {
            game.operations.push(function() {
                game.setState( new PlayState() );
            });
        }

    }

    GameOverState.prototype.resize = function(width, height) {
        this.cx = width / 2;
        this.cy = height / 2;
        this.camera2d.right = width;
        this.camera2d.bottom = height;
        this.camera2d.updateProjectionMatrix();
    };

    GameOverState.prototype.onStop = function(game) {
        game.renderer.autoClear = true;
    };

    GameOverState.prototype.render = function(game) {
        game.renderer.clear();
        game.renderer.render(this.scene2d, this.camera2d);
    };

    return GameOverState;
}).call(this);
