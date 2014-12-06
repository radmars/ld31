Object.defineProperty(Array.prototype, "remove", {
    enumerable: false,
    value: function (item) {
        var removeCounter = 0;

        for (var index = 0; index < this.length; index++) {
            if (this[index] === item) {
                this.splice(index, 1);
                removeCounter++;
                index--;
            }
        }
        return removeCounter;
    }
});

var Game = (function(){
    "use strict;"
    function InputManager(element) {
        this.element = element;
        this.motionEvent = [];
        this.clickEvent = [];
        this.pressEvent = [];
        this.keyUpEvent = [];
        this.keyDownEvent = [];
        this.element.tabIndex = 1;
        this.element.focus();
        this.element.addEventListener('mousemove', this.mouseMove.bind(this));
        this.element.addEventListener('keypress', this.press.bind(this));
        this.element.addEventListener('keydown', this.keyDown.bind(this));
        this.element.addEventListener('keyup', this.keyUp.bind(this));
        this.element.addEventListener('click', this.click.bind(this));
    }

    function generateHandler( field ) {
        return function(e) {
            var handlers = this[field];
            handlers.forEach(function(handler) {
                handler(e);
            });
            return false;
        };
    }

    InputManager.prototype.click = generateHandler( 'clickEvent' );
    InputManager.prototype.press = generateHandler( 'pressEvent' );
    InputManager.prototype.mouseMove = generateHandler( 'motionEvent' );
    InputManager.prototype.keyDown = generateHandler( 'keyUpEvent' );
    InputManager.prototype.keyUp = generateHandler( 'keyDownEvent' );

    function Game(element) {
        var self = this;
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.callback = this.update.bind(this);
        this.settings = {};
        this.mainElement = element;

        // Extract settings with some probably broken regex.
        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(match, key, value) {
            self.settings[key] = value;
        });

        this.operations = [];
        this.mainElement.appendChild(this.renderer.domElement);
        this.input = new InputManager(this.renderer.domElement);
        window.onresize = this.resize.bind(this);
        this.loader = new Loader();
        this.setState(new LoaderState(new IntroState(new PlayState())));
        this.lastFrame = Date.now();
        requestAnimationFrame(function(){
            self.resize();
            self.callback();
        });
    }

    Game.prototype.setState = function(state) {
        if (this.state) {
            this.state.onStop(this);
        }
        this.state = state;
        return this.state.onStart(this);
    };

    Game.prototype.resize = function(event) {
        var r = this.mainElement.getBoundingClientRect();
        this.width = r.width;
        this.height = r.height;
        this.state.resize(this.width, this.height);
        return this.renderer.setSize(this.width, this.height);
    };

    Game.prototype.update = function() {
        var delta, op;
        while ((op = this.operations.pop())) {
            op(this);
        }
        delta = Date.now() - this.lastFrame;
        this.lastFrame = Date.now();
        this.state.update(this, delta);
        this.state.render(this);
        requestAnimationFrame(this.callback);
    };
    return Game;
}).call(this);
