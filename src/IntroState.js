var IntroState = (function(){
    function IntroState( nextState ) {
        State.call(this);
        this.glassesFiles = [
            { name: 'assets/intro/intro_glasses1.png', type: 'img' },
            { name: 'assets/intro/intro_glasses2.png', type: 'img' },
            { name: 'assets/intro/intro_glasses3.png', type: 'img' },
            { name: 'assets/intro/intro_glasses4.png', type: 'img' }
        ];

        this.textFiles = [
            { name: 'assets/intro/intro_mars.png', type: 'img' },
            { name: 'assets/intro/intro_radmars1.png', type: 'img' },
            { name: 'assets/intro/intro_radmars2.png', type: 'img' }
        ];

        this.bgAssetName = "assets/intro/intro_bg.png";

        this.nextState = nextState;

        this.counter = 0;
    }

    IntroState.prototype = Object.create(State.prototype);

    IntroState.prototype.getAssets = function() {
        // Bring it all together!
        return [].concat(
            this.nextState.getAssets(),
            this.glassesFiles,
            this.textFiles,
            { name: this.bgAssetName, type: 'img' }
        );
    }

    IntroState.prototype.onBeat = function() {
        // BEAT IT, JUST BEAT IT
        console.log("BEAT IT BABY")
    }

    IntroState.prototype.resize = function( width, height ) {
        this.cx = width / 2;
        this.cy = height / 2;
    }

    IntroState.prototype.onStart = function(game) {
        var self = this;
        this.scene2d = new THREE.Scene();
        this.camera2d = new THREE.OrthographicCamera( 0, game.width, 0, game.height );
        this.camera2d.position.z = 10;

        game.renderer.setClearColor(0x2e2e2e, 1);
        game.renderer.autoClear = false;

        this.keyHandler = function( e ) {
            if( e.keyCode == 13 ) {
                game.operations.push(function() {
                    game.setState( self.nextState );
                });
            }
        }

        game.input.keyDownEvent.push(this.keyHandler);

        this.textMaterials = this.textFiles.map(function( file ) {
            return new THREE.SpriteMaterial({
                map: game.loader.get( file.name ),
            });
        });

        this.glassesMaterials = this.glassesFiles.map(function( file ) {
            return new THREE.SpriteMaterial({
                map: game.loader.get( file.name ),
            });
        });

        this.textSprite = new THREE.Sprite( this.textMaterials[ 0 ] );
        this.textSprite.scale.set(
            this.textMaterials[0].map.image.width,
            -this.textMaterials[0].map.image.height,
            1
        );

        this.glassesSprite = new THREE.Sprite( this.glassesMaterials[ 0 ] );
        this.glassesSprite.scale.set( 144, -24, 1 );

        var bgMaterial = new THREE.SpriteMaterial({
            map: game.loader.get( this.bgAssetName ),
        });

        this.bgSprite = new THREE.Sprite( bgMaterial );
        this.bgSprite.scale.set( 800, -600, 1 );
        this.scene2d.add(this.bgSprite);
        this.scene2d.add(this.textSprite);
        this.scene2d.add(this.glassesSprite);
        this.controllers.push(function( game, dt ) {
            self.counter += dt;

            if( self.counter < 2000)
                self.textSprite.material = self.textMaterials[ 0 ];
            else if( self.counter < 2050) {
                self.textSprite.scale.set( 192, -28, 1 );
                self.textSprite.material = self.textMaterials[ 1 ];
            }
            else if( self.counter < 2600)
                self.textSprite.material = self.textMaterials[ 2 ];
            else if( self.counter < 2650)
                self.textSprite.material = self.textMaterials[ 1 ];
            else if( self.counter < 2700)
                self.textSprite.material = self.textMaterials[ 2 ];
            else if( self.counter < 2750)
                self.textSprite.material = self.textMaterials[ 1 ];
            else if( self.counter < 2800)
                self.textSprite.material = self.textMaterials[ 2 ];
            else if( self.counter < 2850)
                self.textSprite.material = self.textMaterials[ 1 ];
            else
                self.textSprite.material = self.textMaterials[ 2 ];

            if( self.counter < 2000)
                self.glassesSprite.position.y = ( self.cy ) * (self.counter/2000.0) - 40;
            else if( self.counter < 2150 )
                self.glassesSprite.material = self.glassesMaterials[ 1 ];
            else if( self.counter < 2300 )
                self.glassesSprite.material = self.glassesMaterials[ 2 ];
            else if( self.counter < 2550 )
                self.glassesSprite.material = self.glassesMaterials[ 3 ];
            else
                self.glassesSprite.material = self.glassesMaterials[ 0 ];


            self.bgSprite.position.set( self.cx, 400, 0 );
            self.glassesSprite.position.x = self.cx;

            self.textSprite.position.set(
                self.cx,
                self.cy - 28 / 2 + 80, 0
            );

            if(self.counter > 5000){
                game.operations.push(function() {
                    game.setState( self.nextState );
                });
            }
        });
    };


    IntroState.prototype.render = function( game ) {
        game.renderer.clear();
        game.renderer.render(this.scene2d, this.camera2d);
    }

    IntroState.prototype.onStop = function() {
        game.input.keyDownEvent.remove(this.keyHandler);
    }

    return IntroState;
}());
