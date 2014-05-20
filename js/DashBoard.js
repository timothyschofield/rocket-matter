/**
*/
function DashBoard(rocketWorld) {
    this.rocketWorld = rocketWorld;
    this.render = this.rocketWorld.render;

    // the background to the dashboard
    this.bgX = 5;
    this.bgY = 5;
    this.bgWidth = 300;
    this.bgHeight = 100;

    // the force direction indicator
    this.forceDisplayStartX = 150 + 5;
    this.forceDisplayStartY = 50 + 5;

	if (this.rocketWorld.platform === "desktop")  this.forceScale = 55;
    else this.forceScale = 55 / 2; // compensate for engen strength being x2 on mobile

    this.displayBackground();

}
/**
    style e.g. {fillStyle: 'rgba(0, 255, 0, 0.5)', lineWidth: 3, strokeStyle: 'blue'}
*/
DashBoard.prototype.displayBackground = function() {
    if(this.bg) this.render.stopDraw(this.bg);
    this.bg = this.render.drawRectangle(this.bgX, this.bgY, this.bgWidth, this.bgHeight, {lineWidth: 3, fillStyle: 'rgba(0, 0, 0, 0.5)', strokeStyle: 'white'} );
};

/**
*/
DashBoard.prototype.displayForceLine = function(dx, dy) {
    if(this.forceLine) this.render.stopDraw(this.forceLine);
    this.forceLine = this.render.drawLine(
                                    {x: this.forceDisplayStartX, y: this.forceDisplayStartY}, 
                                    {x:this.forceDisplayStartX + dx * this.forceScale, y: this.forceDisplayStartY + dy * this.forceScale}, 
                                    {lineWidth: 3, strokeStyle: 'red'} );

    if(this.forceText) this.render.stopDraw(this.forceText);
    this.forceText = this.render.drawText("engines x:" + dx.toFixed(1) + " y:" + dy.toFixed(1), 10, 100,  {fillStyle:'white'}) 

};
/**
*/
DashBoard.prototype.displayFPS = function(text) {
    if(this.fpsText) this.render.stopDraw(this.fpsText);
    this.fpsText = this.render.drawText(text, 10, 25,  {fillStyle:'white'}) 
};
/**
*/
DashBoard.prototype.stopDisplayForce = function() {
    if(this.forceLine) this.render.stopDraw(this.forceLine);
    if(this.forceText) this.render.stopDraw(this.forceText);
    this.forceLine = null;
    this.forceText = null;
};





























