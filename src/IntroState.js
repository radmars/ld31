var IntroState = (function(){
    function IntroController( game, nextState ) {
        this.game = game;
        this.glassesFiles = [
            'assets/intro/intro_glasses1.png',
            'assets/intro/intro_glasses2.png',
            'assets/intro/intro_glasses3.png',
            'assets/intro/intro_glasses4.png'
        ];

        this.textFiles = [
            'assets/intro/intro_mars.png',
            'assets/intro/intro_radmars1.png',
            'assets/intro/intro_radmars2.png',
        ];
        this.bgAssetName = "assets/intro/intro_bg.png";

        this.nextState = nextState;

        this.cx = camera.right / 2;
        this.cy = camera.bottom / 2;

        this.counter = 0;

        document.onkeypress = function( e ) {
            if( e.keyCode == 13 ) {
                game.operations.push(function() {
                    game.setState( new Splash() );
                });
            }
        };

        scene.add( this.bgSprite );
        scene.add( this.textSprite );
        scene.add( this.glassesSprite );
    }

    IntroController.getAssets = function() {
        // Bring it all together!
        return [].concat(
            this.nextState.getAssets(),
            this.glassesFiles,
            this.textFiles
        );
    }

    IntroController.prototype.onBeat = function() {
        // BEAT IT, JUST BEAT IT
        console.log("BEAT IT BABY")
    }

    IntroController.prototype.resize = function( width, height ) {
        this.cx = width / 2;
        this.cy = height / 2;
    }

    IntroController.prototype.onStart = function() {
        this.textMaterials = textFiles.map(function( file ) {
            return new THREE.SpriteMaterial({
                map: game.loader.get( file ),
                useScreenCoordinates: true,
                alignment: THREE.SpriteAlignment.topLeft
            });
        });

        this.glassesMaterials = glassesFiles.map(function( file ) {
            return new THREE.SpriteMaterial({
                map: game.loader.get( file ),
                useScreenCoordinates: true,
                alignment: THREE.SpriteAlignment.topLeft
            });
        });

        this.textSprite = new THREE.Sprite( this.textMaterials[ 0 ] );
        this.textSprite.scale.set( 108, 28, 1 );

        this.glassesSprite = new THREE.Sprite( this.glassesMaterials[ 0 ] );
        this.glassesSprite.scale.set( 144, 24, 1 );

        var bgMaterial = new THREE.SpriteMaterial({
            map: this.game.loader.get( this.bgAssetName ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        });

        this.bgSprite = new THREE.Sprite( bgMaterial );
        this.bgSprite.scale.set( 800, 600, 1 );
    };


    IntroController.prototype.onStop = function() {
        document.onkeypress = function( e ) {
        };
    }

    IntroController.prototype.update = function( dt ) {
        this.counter += dt;

        if( this.counter < 2000)
            this.textSprite.material = this.textMaterials[ 0 ];
        else if( this.counter < 2050) {
            this.textSprite.scale.set( 192, 28, 1 );
            this.textSprite.material = this.textMaterials[ 1 ];
        }
        else if( this.counter < 2600)
            this.textSprite.material = this.textMaterials[ 2 ];
        else if( this.counter < 2650)
            this.textSprite.material = this.textMaterials[ 1 ];
        else if( this.counter < 2700)
            this.textSprite.material = this.textMaterials[ 2 ];
        else if( this.counter < 2750)
            this.textSprite.material = this.textMaterials[ 1 ];
        else if( this.counter < 2800)
            this.textSprite.material = this.textMaterials[ 2 ];
        else if( this.counter < 2850)
            this.textSprite.material = this.textMaterials[ 1 ];
        else
            this.textSprite.material = this.textMaterials[ 2 ];

        if( this.counter < 2000)
            this.glassesSprite.position.y = ( this.cy - this.glassesSprite.scale.y / 2 ) * (this.counter/2000.0);
        else if( this.counter < 2150 )
            this.glassesSprite.material = this.glassesMaterials[ 1 ];
        else if( this.counter < 2300 )
            this.glassesSprite.material = this.glassesMaterials[ 2 ];
        else if( this.counter < 2550 )
            this.glassesSprite.material = this.glassesMaterials[ 3 ];
        else
            this.glassesSprite.material = this.glassesMaterials[ 0 ];

        this.bgSprite.position.set( this.cx - 800/2, this.cy - 600/2, 0 );
        this.textSprite.position.set( this.cx - 108/2 , 377, 0 );
        this.glassesSprite.position.x = this.cx - 144/2;

        this.textSprite.position.set(
            this.cx - this.textSprite.scale.x/2 ,
            this.cy - 28 / 2 + 80, 0
        );

        var game = this.game;
        if(this.counter > 5000){
            game.operations.push(function() {
                game.setState( new Splash() );
            });
        }
    }

