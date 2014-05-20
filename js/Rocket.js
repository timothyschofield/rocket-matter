/**
 * Created by Timothy on 12/04/14.
  0, 0 is the top left hand of the screen, +ve x goes right, +ve y goes down
  xPos, yPos is the center of the rocket

      var key, text = "";
    for(key in keys)
        text += key + ":" + keys[key] + "  ";
    console.log(text);
 */

function Rocket(rocketGame, xPos, yPos) {

    this.rocketGame = rocketGame;
    this.render = this.rocketGame.render;
    this.engine = this.rocketGame.engine;
    this.world = this.rocketGame.world;

    this.xPos = xPos;
    this.yPos = yPos;
 
    var $debug = $('#debug');

    if (this.rocketGame.platform === "desktop") {
		this.engineStrengthX = 0.5         // was 0.5
		this.engineStrengthY = 0.7         // was 0.7 to overcome gravity
    } else {
		this.engineStrengthX = 0.5 * 2;    // we get 60fps on desktop and only 30fps on mobile
		this.engineStrengthY = 0.7 * 2;    // so go figure!
    }



    this.mouseDown = false;

    this.dashBoard = new DashBoard(this.rocketGame);

    this.thisKeys = new Keys();
    this.keyListeners = [];
    this.keyListeners.push( this.thisKeys.addGameEventListener(Keys.KEYDOWN, this.doActionKeyDown, this) );
    this.keyListeners.push( this.thisKeys.addGameEventListener(Keys.KEYUP, this.doActionKeyUp, this) );

    this.rocketListeners = [];
    this.rocketListeners.push( this.addGameEventListener('ROCKET_FIRE', this.fire, this) );

    this.domListeners = [];

    var self = this;
   
    this.canvasID = document.getElementsByTagName('canvas')[0];  // the first and only canvas element
    this.fireButtonID = document.getElementById('fireButton');
    this.resetButtonID = document.getElementById('resetButton');

    /////////////////////////// MOUSE EVENTS ///////////////////////////
    // addDOMEventListener(target, type, callback, bubble) - so they can be deleted automaticaly

    this.addDOMEventListener(this.canvasID, 'mousedown', function(event) {
         if(event.offsetX) self.startEngines( {x: event.offsetX, y: event.offsetY} );   // chrome, IE
         else  self.startEngines( {x: event.layerX, y: event.layerY} );                 // firefox
     }, false);

    this.addDOMEventListener(this.canvasID, 'mousemove', function(event) {
        if(event.offsetX) self.fireEngines( {x: event.offsetX, y: event.offsetY} );     // chrome, IE
        else self.fireEngines( {x: event.layerX, y: event.layerY} );                    // firefox
    }, false);

    this.addDOMEventListener(this.canvasID, 'mouseup',function(event) {
        self.stopEngines();
    }, false);

    this.addDOMEventListener(this.fireButtonID, 'mousedown',function(event) {
         self.fire(); 
    }, false);

    this.addDOMEventListener(this.resetButtonID, 'mousedown',function(event) {
         self.rocketGame.initRocketGame();  
    }, false);
    /////////////////////////// TOUCH EVENTS ///////////////////////////
    // addDOMEventListener(target, type, callback, bubble) - so they can be deleted automaticaly

    this.addDOMEventListener(this.canvasID, 'touchstart', function(event) {
        self.startEngines( {x: event.changedTouches[0].pageX, y: event.changedTouches[0].pageY} ); 
    }, false);

    this.addDOMEventListener(this.canvasID, 'touchmove',  function(event) {
        self.fireEngines( {x: event.changedTouches[0].pageX, y: event.changedTouches[0].pageY} ); 
        event.preventDefault(); // prevents the browser scrolling the page on touchmove
    }, false);

    this.addDOMEventListener(this.canvasID, 'touchend', function(event) {
        self.stopEngines();
    }, false);

    this.addDOMEventListener(this.fireButtonID, 'touchstart', function(event) {
        self.fire(); 
    }, false);

    this.addDOMEventListener(this.resetButtonID, 'touchstart', function(event) {
        self.rocketGame.initRocketGame();  
    }, false);
    //////////////////////////// END EVENTS //////////////////////////////

    this.body = Matter.Bodies.rocket(this.xPos, this.yPos, { 
                        frictionAir: 0.05, 
                        friction: 0.01,
                        rocket: true, 
                        rocketGravityStrength: { x: 0.0, y: 0.0 },      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< GRAVITY 0.25
                        rocketForce: { x: 0, y: 0.0 },
                        restitution: 0.5,                               // restitution read bounce
                     
                        render: {
                            sprite: {
                                texture: './img/Rocket1.png'
                            }
                        }
                    });
                      
}
Rocket.prototype = Object.create(EventDispatcher.prototype);
Rocket.prototype.constructor = Rocket;
/*
    Fires a bullet
 */
Rocket.prototype.fire = function (event) {

    var gunOffsetX = 45;
    var gunOffsetY = 0;

    var bulletW = 10;
    var bulletH = 10;

    var gunPosX = this.body.position.x + gunOffsetX;
    var gunPosY = this.body.position.y + gunOffsetY;

    var bulletSpeed;
    if(this.rocketGame.platform === "desktop") bulletSpeed = 20;
    else bulletSpeed = 30;      // beacuse the mobile only runs at 30 fps and makes bullets droopy

    //console.log(gunPosX)
    Matter.World.add(this.world, Matter.Bodies.rectangle(gunPosX, gunPosY, bulletW, bulletH,
        {  frictionAir: 0.01 ,
           bullet: true,
           bulletPositionPrev: {x: gunPosX - bulletSpeed, y: gunPosY}
        })
    );
   
};
/*
 */
Rocket.prototype.doActionKeyDown = function () {
 
    var keys = this.thisKeys.getKeysDown();
    this.doMove(keys);
    if(keys.Fire) this.fire(); 

};
/*
 */
Rocket.prototype.doActionKeyUp = function () {
    var keys = this.thisKeys.getKeysDown();
    this.doMove(keys);
};
/*
*/
Rocket.prototype.doMove = function (keys) {

    // if the engines are not under mose control
    if(!this.mouseDown) {
        var upF = 0,
            downF = 0,
            rightF = 0,
            leftF = 0;

        if (keys.Up) { upF = -this.engineStrengthY; }
        if (keys.Down) { downF = this.engineStrengthY; }
        this.body.rocketForce.y = upF + downF;

        if (keys.Right) { rightF = this.engineStrengthX; }
        if (keys.Left) { leftF = -this.engineStrengthX; }
        this.body.rocketForce.x = rightF + leftF;

        this.dashBoard.displayForceLine(this.body.rocketForce.x, this.body.rocketForce.y);
 
    }

};
/*
    addEventListener does not return a handle damb it!
    Creates a standard DOM listener and remembers its signature in the domListeners list
    so it can be automaticaly deleted before reset. If we don't do this we get multiple listeners registerd.
    e.g. addDOMEventListener( buttonX, 'mousedown', function () {...}, false );
 */

Rocket.prototype.addDOMEventListener = function (target, eventType, callback, bubble) {
    if (target) {
        this.domListeners.push({ target: target, eventType: eventType, callback: callback, bubble: bubble });
        target.addEventListener(eventType, callback, bubble);
    } else {
        console.log("Attempting to add listener to non existent DOM target:", target);
    }
};

/*
 Deletes all things created by Rocket
 */
Rocket.prototype.removeAllListeners = function () {

    this.domListeners.forEach(function(thisListener) {
        thisListener.target.removeEventListener(thisListener.eventType, thisListener.callback, thisListener.bubble || false);
    });
    this.domListeners = [];

    var self = this;
    this.keyListeners.forEach(function(thisListener) {
        self.thisKeys.removeGameEventListener(thisListener.eventType, thisListener.callback, thisListener.context);
    });
    this.keyListeners = [];
    this.thisKeys.removeKeyListeners();

    this.rocketListeners.forEach(function(thisListener) {
        self.removeGameEventListener(thisListener.eventType, thisListener.callback, thisListener.context);
    });
    this.rocketListeners = [];

};
/*
    Call on mousedown
    this.engineStartX = mousePos.x + this.rocketGame.animOffset;

 */
Rocket.prototype.startEngines = function (mousePos) {
    if(this.rocketGame.platform === "desktop")
        this.engineStartX = mousePos.x + this.rocketGame.animOffset;
    else
        this.engineStartX = mousePos.x; // bacause with touch events offsets are alays from the viewport, not the target

    this.engineStartY = mousePos.y;
    this.mouseDown = true;
};
/*
    Call on mousemove
    var xPos = mousePos.x + this.rocketGame.animOffset;
*/
Rocket.prototype.fireEngines = function (mousePos) {
    var xPos;
    var yPos

    if(this.mouseDown) {
        // engine under mouse control
        if(this.rocketGame.platform === "desktop")  xPos = mousePos.x + this.rocketGame.animOffset;
        else xPos = mousePos.x; // because with touch events co-ords are always relative to the page, NOT the target on which the listener was bound
       
        yPos = mousePos.y;

        // so dx will be between -maxDx and +maxDx
        // This means that from applying maximum +ve force to maximum -ve force the mouse moves maxDx * 2 pixels
        var maxDx = 30;
        var maxDy = 30;
        var dx = xPos - this.engineStartX;
        var dy = yPos - this.engineStartY;
        if(dx > maxDx) dx = maxDx;
        if(dx < -maxDx) dx = -maxDx;
        if(dy > maxDx) dy = maxDy;
        if(dy < -maxDy) dy = -maxDy;

        // forces got from mouse position
        this.body.rocketForce.x = dx * this.engineStrengthX/maxDx;
        this.body.rocketForce.y = dy * this.engineStrengthY/maxDy;

        this.dashBoard.displayForceLine(this.body.rocketForce.x, this.body.rocketForce.y);

     }
     
};
/**
*/
Rocket.prototype.stopEngines = function () {
    this.dashBoard.stopDisplayForce();
    this.mouseDown = false;
    this.body.rocketForce.x = 0;
    this.body.rocketForce.y = 0;
};
/**
*/
Rocket.prototype.clearDebug = function () {
    if(this.debugText) this.render.stopDraw(this.debugText);
};
/**
*/
Rocket.prototype.debug = function (lineNum, text) {
   if(this.debugText) this.render.stopDraw(this.debugText);
   this.debugText = this.render.drawText(text, 10, lineNum * 16, {fillStyle:'white'});
};
/*
 */
Rocket.prototype.pause = function () {

    if (this.rocketGame.gamePlaying) {
        this.rocketGame.gamePlaying = false;
        // we have to/can draw the "paused" text here because: 
        // 1. we cannot pause the render engine and then expect to have the text rendered to the canvas and 
        // 2. we don't need to be in the render.update loop because the text only needs drawing once because the engine is stopped
        // NOTE: this is not the usualy way to use Draw - seek other examples
        this.pausedText = this.render.drawText("paused", 10, 460, "30px Arial", 'rgb(255,0,0)');
        this.pausedText.call();
        $('#canvas-container').stop();
        this.engine.enabled = false;
    } else {
        this.render.stopDraw(this.pausedText);
        this.rocketGame.gamePlaying = true;
        this.rocketGame.startAnimation();
        this.engine.enabled = true;
    }
    
};












