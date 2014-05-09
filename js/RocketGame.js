(function () {

    // Matter aliases
    var Engine = Matter.Engine,
        Gui = Matter.Gui,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        RenderPixi = Matter.RenderPixi,
        Events = Matter.Events,
        Bounds = Matter.Bounds,
        Vector = Matter.Vector,
        Vertices = Matter.Vertices,
        MouseConstraint = Matter.MouseConstraint;

    var RocketGame = {};

    var _engine;
    var _world; // _engine.world;
    var _mouseConstraint;
    var _isMobile = /(ipad|iphone|ipod|android)/gi.test(navigator.userAgent);

    /*****************************************
    window.load fires this
    ******************************************/
    RocketGame.initEngine = function () {

        if (_isMobile) {
            RocketGame.platform = "mobile";
        } else {
            RocketGame.platform = "desktop";
        }

        console.log("platform: " + RocketGame.platform);

        RocketGame.gameState = "notstarted"; // "notstarted", "playing", "paused"
        RocketGame.rocket1 = null;
        RocketGame.orientation = "landscape";    // default
        RocketGame.imagesLoadedFlag = false;

        RocketGame.worldWidth = 1600;
        RocketGame.worldHeight = 467;

        RocketGame.rocketL = RocketGame.worldWidth / 4;
        RocketGame.rocketT = RocketGame.worldHeight / 2;

        RocketGame.doAnimation = true;
        RocketGame.animTime = 40 * 1000; // for moving the canvas right

        if (RocketGame.platform === "desktop") {
            RocketGame.animaDistance = -800;
        } else {
            RocketGame.animaDistance = -480;
        }

        var canvasContainer = document.getElementById('canvas-container');
        var rocketGameResetButton = document.getElementById('rocketGameResetButton');
        rocketGameResetButton.addEventListener('click', function (e) {
            RocketGame.initRocketGame();
        });

        // engine options - these are the defaults
        var options = {
            positionIterations: 6,  // origonaly 6
            velocityIterations: 4,  // origonaly 4
            enableSleeping: false,  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< origonaly false  
            timeScale: 1,           // origonaly 1 - experiment with instability
            render: {
                options: {
                    width: RocketGame.worldWidth,
                    height: RocketGame.worldHeight
                }
            }
        };

        // create a Matter engine, with the element to insert the canvas into
        // NOTE: this is actually Matter.Engine.create(), see the aliases at top of this file
        _engine = Engine.create(canvasContainer, options);
        _world = _engine.world;
        _world.gravity.y = 1;                        // turn/off of gravity

        var renderOptions = _engine.render.options;
        renderOptions.wireframes = false;             // wireframe or coloured blocks
        renderOptions.showDebug = true;               // debug statistics overlayed on screen
        renderOptions.showBroadphase = false;
        renderOptions.showBounds = false;
        renderOptions.showVelocity = false;
        renderOptions.showCollisions = false;
        renderOptions.showAxes = false;
        renderOptions.showPositions = false;
        renderOptions.showAngleIndicator = false;
        renderOptions.showIds = false;                // show numerical ids
        renderOptions.showShadows = false;            // used with coloured blocks
        renderOptions.background = '#444';

        Engine.run(_engine);
        _engine.enabled = false;

        // set up a scene with bodies
        RocketGame.initRocketGame();
    };
    /*
    orientation comes from index.html
    */
    RocketGame.initRocketGame = function () {

        RocketGame.clearWorld();

        if (RocketGame.rocket1) {
            RocketGame.rocket1.removeAllListeners();
            RocketGame.rocket1 = null;
        }

        RocketGame.imageHandles = {};
        RocketGame.loadAllImages([
            { name: "rocket1", path: "./img/Rocket1.png" }
            ],
            function (imageHandles) {
                console.log("images loaded");

                RocketGame.bWorld = new BlockWorld(_world);
                RocketGame.bWorld.init();

                RocketGame.imagesLoadedFlag = true;
                RocketGame.imageHandles = imageHandles;
                RocketGame.rocket1 = new Rocket(_world, _engine, RocketGame.rocketL, RocketGame.rocketT, RocketGame.imageHandles["rocket1"]);

                World.add(_world, RocketGame.rocket1.body);
                // World.add(_world, Composites.chopper());

                $('#floatingCirclesG').hide();
                $('#messageText').show();

                // has to be after bodies are created
                _mouseConstraint = MouseConstraint.create(_engine);
                World.add(_world, _mouseConstraint);

                if (RocketGame.gameState == "playing") {
                    if (RocketGame.doAnimation) {
                        console.log("start animation because game playing")
                        $('#canvas-container').animate({ left: RocketGame.animaDistance + 'px' }, RocketGame.animTime, 'linear', function () {
                            console.log("anim ended");
                        });
                    }
                }
            });

    };
    /*
    */
    RocketGame.changeOrientation = function (windowOrientation) {
        console.log("orientation = " + windowOrientation);

        if (windowOrientation === undefined) {
            RocketGame.orientation = "landscape"; // we are on a desktop
        } else {
            switch (windowOrientation) {
                case 0:   // Portrait
                    RocketGame.orientation = "portrait";
                    break;
                case 90:  // Landscape   
                    RocketGame.orientation = "landscape";
                    break;
                case -90: // counterclockwise Landscape
                    RocketGame.orientation = "landscape";
                    break;
                default: // assume Landscape
                    RocketGame.orientation = "landscape";
            }
        }

        var $splashScreen = $("#splashScreen");
        var $rocketGame = $("#rocketGame");
        var $messageText = $('#messageText');

        $splashScreen.show();
        $rocketGame.hide();

        if (RocketGame.orientation === "landscape") {
            $messageText.text("Click to start");
            $splashScreen.on('click', startGame);
        } else {
            $messageText.text("Tilt to play");
            $splashScreen.off('click');

        }

        function startGame() {
            RocketGame.gameState = "playing";
            $splashScreen.hide();
            $rocketGame.show();
            console.log("startGame ============================== ")
            if (RocketGame.doAnimation) {
                $('#canvas-container').animate({ left: RocketGame.animaDistance + 'px' }, RocketGame.animTime, 'linear', function () {
                    console.log("anim ended");
                });
            }
            _engine.enabled = true; // probably need pause or something
        }
    };
    /*
    */
    RocketGame.clearWorld = function () {

        World.clear(_world);
        Engine.clear(_engine);

        $('#canvas-container').stop(); // stop the current animation (if we are in the middle of one)
        $('#canvas-container').css({ 'left': '0px' });

        // clear scene graph (if defined in controller)
        var renderController = _engine.render.controller;
        if (renderController.clear)
            renderController.clear(_engine.render);

        if (Events) {

            // clear all events
            Events.off(_engine);

            // add event for deleting bodies and constraints with right mouse button
            Events.on(_engine, 'mousedown', function (event) {
                var mouse = event.mouse,
                    engine = event.source,
                    bodies = Composite.allBodies(engine.world),
                    constraints = Composite.allConstraints(engine.world),
                    i;

                if (mouse.button === 2) {

                    // find if a body was clicked on
                    for (i = 0; i < bodies.length; i++) {
                        var body = bodies[i];
                        if (Bounds.contains(body.bounds, mouse.position)
                                && Vertices.contains(body.vertices, mouse.position)) {

                            // remove the body that was clicked on
                            Composite.remove(engine.world, body, true);
                        }
                    }

                    // find if a constraint anchor was clicked on
                    for (i = 0; i < constraints.length; i++) {
                        var constraint = constraints[i],
                        bodyA = constraint.bodyA,
                        bodyB = constraint.bodyB;

                        // we need to account for different types of constraint anchor
                        var pointAWorld = constraint.pointA,
                        pointBWorld = constraint.pointB;
                        if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
                        if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);

                        // if the constraint does not have two valid anchors, skip it
                        if (!pointAWorld || !pointBWorld)
                            continue;

                        // find distance between mouse and anchor points
                        var distA = Vector.magnitudeSquared(Vector.sub(mouse.position, pointAWorld)),
                        distB = Vector.magnitudeSquared(Vector.sub(mouse.position, pointBWorld));

                        // if mouse was close, remove the constraint
                        if (distA < 100 || distB < 100) {
                            Composite.remove(engine.world, constraint, true);
                        }
                    }


                } // eo mouse button = 2
            });
        }


    };
    /*
    imageList - list of objects [{"name1, "path1"},...]
    callback returns when all images are loaded with an object { name1: imageObject1, name2: imageObject2...}
    If an image failed to load its imageHandle is null.
    */
    RocketGame.loadAllImages = function (imageList, callback) {
        var numImages = imageList.length;
        var n;
        var thisImg;
        var imageLoadedCount = 0;
        var imageHandles = {};

        for (n = 0; n < numImages; n++) {
            loadImage(imageList[n]);
        }

        var self = this;
        function loadImage(thisImageObject) {
            var thisImage = new Image();
            thisImage.src = thisImageObject.path;

            thisImage.onload = function () {
                imageLoadedCount++;
                //console.log("loaded " + thisImageObject.path);
                imageHandles[thisImageObject.name] = this;

                if (imageLoadedCount === numImages) {
                    callback.call(self, imageHandles);
                }
            }

            thisImage.onerror = function () {
                console.log("error loading image " + thisImageObject.path);
                imageLoadedCount++;
                imageHandles[thisImageObject.name] = null;
            };
        }
    };
    /**
    * Called to set the rocket location when a a world description is loaded from file
    */
    RocketGame.setRocketLocation = function (rocketL, rocketT) {
        RocketGame.rocketL = rocketL;
        RocketGame.rocketT = rocketT;
    };
    /*
    Sets it all off
    */
    if (window.addEventListener) {
        window.addEventListener('load', RocketGame.initEngine);
    } else if (window.attachEvent) {
        window.attachEvent('load', RocketGame.initEngine);
    }

    // make RocketGame available on window
    if (typeof window === 'object' && typeof window.document === 'object') {
        window.RocketGame = RocketGame;
    }

})();