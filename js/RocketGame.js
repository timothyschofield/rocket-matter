/*
*/
/*****************************************
Matter is global and contains references to all the Matter engine components
******************************************/
function RocketGame() {

    this.engine;
    this.world;
    this.rocket;

    this.windowWidthDesktop = 800;
    this.windowWidthMobile = 480;

    if ( /(ipad|iphone|ipod|android)/gi.test(navigator.userAgent) ) {    
        this.platform = "mobile";
        this.windowWidth = this.windowWidthMobile;
        this.animaDistance = -this.windowWidthMobile;
    } else {
        this.platform = "desktop";
        this.windowWidth = this.windowWidthDesktop;
        this.animaDistance = -this.windowWidthDesktop;
    }

    this.canvasWidth = 1600;
    this.canvasHeight = 467;

    this.gamePlaying = false;
    this.orientation = "landscape";    // default
    this.imagesLoadedFlag = false;

    this.rocketL = this.canvasWidth / 4;
    this.rocketT = this.canvasHeight / 2;

    this.doAnimation = true;     // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< ANIMATION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    this.animTime = 35 * 1000; // for moving the canvas rightwards
    this.animOffset = 0; 
  
    var canvasContainer = document.getElementById('canvas-container');

    // engine options - these are the defaults
    var options = {
        positionIterations: 6,  // origonaly 6
        velocityIterations: 4,  // origonaly 4
        enableSleeping: false,  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< SLEEP <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        timeScale: 1,           // origonaly 1 - experiment with instability
        render: {
            options: {
                width: this.canvasWidth,
                height: this.canvasHeight
            }
        }
    };

    // create a Matter engine, with the element to insert the canvas into
    this.engine = Matter.Engine.create(canvasContainer, options);
    this.engine.rocketGame = this;
    this.world = this.engine.world;
    this.world.gravity.y = 1;                 // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< turn/off Block of gravity

    var renderOptions = this.engine.render.options;
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

    Matter.Engine.run(this.engine);
    this.engine.enabled = false;

    this.initRocketGame();
   
}
/*
orientation comes from index.html
*/
RocketGame.prototype.initRocketGame = function () {

    this.clearWorld();

    if (this.rocket) {
        this.rocket.removeAllListeners();
    }
    Draw.renderList = [];
    this.render = new Draw(this);

    this.bWorld = new BlockWorld(this);
    this.bWorld.init();
    this.rocket = new Rocket(this, this.rocketL, this.rocketT);

    Matter.World.add(this.world, this.rocket.body);

    $('#floatingCirclesG').hide();
    $('#messageText').show();

    if (this.gamePlaying && this.doAnimation) {
        //console.log("start because game is reset");
        this.startAnimation();
    }
};
/*
*/
RocketGame.prototype.changeOrientation = function (windowOrientation) {

	if (windowOrientation === undefined) {
		this.orientation = "landscape"; // we are on a desktop
	} else {
		switch (windowOrientation) {
			case 0: this.orientation = "portrait"; break; // Portrait
			case 90: this.orientation = "landscape"; break; // Landscape   
			case -90: this.orientation = "landscape"; break; // counterclockwise Landscape
			default: this.orientation = "landscape"; // assume Landscape
		}
	}

	var $splashScreen = $("#splashScreen");
	var $rocketGame = $("#rocketGame");
	var $messageText = $('#messageText');
	var $instructions = $('#instructions');

	$splashScreen.show();
	$rocketGame.hide();

	if (this.platform === "mobile") {
		if (this.orientation === "landscape") {
			$messageText.text("Click to start");
			$splashScreen.on('click', startGame);
		} else {
			$messageText.text("Tilt to play");
			$splashScreen.off('click');
		}
	} else {
		$instructions.css('visibility', 'visible');
		$splashScreen.on('click', startGame);
	}

	var self = this;
	function startGame() {
		self.gamePlaying = true;
		$splashScreen.hide();
		$rocketGame.show();
		if (self.doAnimation) {
			//console.log("start because game is splashscreen clicked");
			self.startAnimation();
		}
		self.engine.enabled = true; // probably need pause somewhere
	}

};
/*
*/
RocketGame.prototype.startAnimation = function () {
    // problem with pauseing and animTime - need to subtract time elapsed before pause
    var self = this;

    $('#canvas-container').animate({ left: this.animaDistance + 'px' },
                                {
                                    start: function () {
                                        //console.log("start");
                                    },
                                    duration: this.animTime,
                                    easing: 'linear',
                                    step: function (dx, fx) {
                                        self.animOffset = dx * self.windowWidthDesktop/self.windowWidth;
                                    },
                                    done: function () {
                                        //console.log("anim ended");
                                    }
                                });
    
   
};
/**
*/
RocketGame.prototype.clearWorld = function () {

    Matter.World.clear(this.world);
    Matter.Engine.clear(this.engine);

    $('#canvas-container').stop(); // stop the current animation (if we are in the middle of one)
    $('#canvas-container').css({ 'left': '0px' });

    // clear scene graph (if defined in controller)
    var renderController = this.engine.render.controller;
    if (renderController.clear)
        renderController.clear(this.engine.render);

};
/*
    imageList - list of objects [{"name1, "path1"},...]
    callback returns when all images are loaded with an object { name1: imageObject1, name2: imageObject2...}
    If an image failed to load its imageHandle is null.
*/
RocketGame.prototype.loadAllImages = function (imageList, callback) {
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
* Called to set the rocket location when a world description is loaded from file
*/
RocketGame.prototype.setRocketLocation = function (rocketL, rocketT) {
    this.rocketL = rocketL;
    this.rocketT = rocketT;
};
/*
*/
RocketGame.prototype.print = function (indent, thing) {

    if(indent > 3) return "";

    var tab = "";
    var ret1 = "";
    for(var n = 0; n < indent; n++)
        tab += "  ";

    var thisType = typeof thing;

    if(thisType !== "object") {
        ret1 = tab + thisType + " " + thing;
    } else {

        if (thing instanceof Array) {
            ret1 += tab + "array";
           indent++;
            for(var n = 0; n < thing.length; n++)
                ret1 += ( "<br>" + tab + this.print(indent, thing[n]) );
           
        } else {
            ret1 += tab + "hash";
            indent++;
            for(key in thing) {
                ret1 += "<br>" + tab + key + ":";
                ret1 += this.print(indent, thing[key]);
            }
            
        }
    }

    return ret1;
};

