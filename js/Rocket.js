/**
 * Created by Timothy on 12/04/14.
  0, 0 is the top left hand of the screen, +ve x goes right, +ve y goes down
  xPos, yPos is the center of the rocket
 */
function Rocket(world, engine, xPos, yPos, imageHandle) {

    this.engine = engine;
    this.world = world;
    this.xPos = xPos;
    this.yPos = yPos;
    this.imageHandle = imageHandle;

    this.engineStrengthX = 0.5;
    this.engineStrengthY = 0.7;

    this.listeners = [];

    // probably shouldn't create Keys here - this should be a global thing used by all
    this.thisKeys = new Keys();
    this.keyListeners = [];
    this.keyListeners.push(this.thisKeys.addGameEventListener(Keys.KEYDOWN, this.doAction, this));
    this.keyListeners.push(this.thisKeys.addGameEventListener(Keys.KEYUP, this.cutEngines, this));

    // for touch screens and mouse clicks
    var addForceY = document.getElementById('addForceY');
    this.addRocketEventListener(addForceY, 'touchstart', fnaddForceY, false);
    this.addRocketEventListener(addForceY, 'touchend', fnstopForceY, false);
    this.addRocketEventListener(addForceY, 'mousedown', fnaddForceY, false);
    this.addRocketEventListener(addForceY, 'mouseup', fnstopForceY, false);

    var addForceRight = document.getElementById('addForceRight');
    this.addRocketEventListener(addForceRight,'touchstart', fnaddForceRight, false);
    this.addRocketEventListener(addForceRight,'touchend', fnstopForceRight, false);
    this.addRocketEventListener(addForceRight,'mousedown', fnaddForceRight, false);
    this.addRocketEventListener(addForceRight,'mouseup', fnstopForceRight, false);

    var addForceLeft = document.getElementById('addForceLeft');
    this.addRocketEventListener(addForceLeft, 'touchstart', fnaddForceLeft, false);
    this.addRocketEventListener(addForceLeft, 'touchend', fnstopForceLeft, false);
    this.addRocketEventListener(addForceLeft, 'mousedown', fnaddForceLeft, false);
    this.addRocketEventListener(addForceLeft, 'mouseup', fnstopForceLeft, false);

    var fireButton = document.getElementById('fireButton');
    this.addRocketEventListener(fireButton, 'touchstart', fnFire, false);
    this.addRocketEventListener(fireButton, 'mousedown', fnFire, false);

    var pauseButton = document.getElementById('pauseButton');
    this.addRocketEventListener(pauseButton, 'touchstart', fnPause, false);
    this.addRocketEventListener(pauseButton, 'mousedown', fnPause, false);

    var resetButton = document.getElementById('resetButton');
    this.addRocketEventListener(resetButton, 'touchstart', fnReset, false);
    this.addRocketEventListener(resetButton, 'mousedown', fnReset, false);

    var self = this;
    function fnaddForceY(e) { self.body.rocketForce.y = -self.engineStrengthY; };
    function fnstopForceY(e) { self.body.rocketForce.y = 0; };
    function fnaddForceRight(e) { self.body.rocketForce.x = self.engineStrengthX; };
    function fnstopForceRight(e) { self.body.rocketForce.x = 0; };
    function fnaddForceLeft(e) { self.body.rocketForce.x = -self.engineStrengthX; };
    function fnstopForceLeft(e) { self.body.rocketForce.x = 0; };

    function fnFire(e) { self.fire(); };
    function fnPause(e) { self.pause(); };
    function fnReset(e) { RocketGame.initRocketGame(); };

    // restitution makes it bounce
    this.body = Matter.Bodies.rocket(this.xPos, this.yPos, { 
                        frictionAir: 0.05, 
                        friction: 0.01,
                        rocket: true, 
                        rocketGravityStrength: { x: 0.0, y: 0.25 },    // 0.25
                        rocketForce: { x: 0, y: 0.0 },
                        restitution: 0.5,
                        render: {
                            sprite: {
                                texture: './img/Rocket1.png'
                            }
                        }
                    });
                      
    this.body.rocketImg = this.imageHandle;
   
}
/*
 */
Rocket.prototype.fire = function () {
    var bulletW = 10;
    var bulletH = 10;
    var gunOffsetX = 40;
    var gunOffsetY = 0;
    var gunPosX = this.body.position.x + gunOffsetX;
    var gunPosY = this.body.position.y + gunOffsetY;
    var bulletSpeed = 20;
  
    Matter.World.addBody(this.world, Matter.Bodies.rectangle(gunPosX, gunPosY, bulletW, bulletH,
        {  frictionAir: 0.01 ,
           bullet: true,
           bulletPositionPrev: {x: gunPosX - bulletSpeed, y: gunPosY},
           bulletComposite: this.world,
           markedForDelete: false
        })
    );
};
/*
 */
Rocket.prototype.pause = function () {
    this.engine.enabled = !this.engine.enabled;
};
/*
 */
Rocket.prototype.doAction = function (eventData) {

    var self;
    if (eventData) {
        self = eventData.data.thisContext;
    } else {
        self = this;
    }

    var keys = this.thisKeys.getKeysDown();
    /*
    var print = "";
    for (key in keys) {
        print += key + ":" + keys[key] + ", ";
    }
    console.log(print);
    */

    if (keys.Fire) { 
        self.fire(); 
    };

    var upF = 0,
        downF = 0,
        rightF = 0,
        leftF = 0;

    if (keys.Up) { upF = -self.engineStrengthY; }
    if (keys.Down) { downF = self.engineStrengthY; }
    self.body.rocketForce.y = upF + downF;

    if (keys.Right) { rightF = self.engineStrengthX; }
    if (keys.Left) { leftF = -self.engineStrengthX; }
    self.body.rocketForce.x = rightF + leftF;

};
/*
    e.g. buttonX, 'mousedown', function () {...}, false
 */
Rocket.prototype.addRocketEventListener = function (target, type, callback, bubble) {
    this.listeners.push( {target: target, type: type, callback: callback, bubble: bubble} );
    target.addEventListener(type, callback, bubble);
};
/*
 Deletes all things created by Rocket
 */
Rocket.prototype.removeAllListeners = function () {

    this.listeners.forEach(function(thisListener) {
        thisListener.target.removeEventListener(thisListener.type, thisListener.callback, thisListener.bubble || false);
    });

    this.listeners = [];

    var self = this;
    this.keyListeners.forEach(function(thisListener) {
        self.thisKeys.removeGameEventListener(thisListener.eventType, thisListener.callback, thisListener.context)
    });

    this.keyListeners = [];

    this.thisKeys.removeKeyListeners();

};
/*
    Called on keyup
 */
Rocket.prototype.cutEngines = function (eventData) {

    var self;
    if (eventData) {
        self = eventData.data.thisContext;
    }  else {
        self = this;
    }
    self.body.rocketForce.x = 0;
    self.body.rocketForce.y = 0;

};














