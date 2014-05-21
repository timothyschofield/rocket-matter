/**
    Used for drawing into the canvas
    Rendering to the canvas must be done at a particular moment in the world.update/world.render loop.
    If you happen to render and image just before a canvas refresh, for instance, you will see nothing.
    Also rendering must be done every frame for a persistant image to be visible.

    To render an something (text, rectangle, line etc.), add the function that renders it to the renderList.
    e.g. from the rocketGame call this.render.drawText("TEST TEXT", 10, 460) - this will add the drawText function automaticaly to the render list
    This will then be rendered every frame when the render.update() function is called in the matter.js engine.
    e.g. 
        this.pausedText = this.rocketGame.render.drawText("paused", 10, 460);
        // when you want to stop rendering
        this.rocketGame.render.stopDraw(this.pausedText);
*/

/*	Out of date
    Why is renderList declared as a static?
    Most drawing is done using the single instance of Draw (called "render") in the RocketGame.
    However, CanvasButton inherits from Draw so that it has access to Draw's drawing routines. When
    a new instance of CanvasButton is created by the CanvasButtonManager the Draw Constructor is called (in the CanvasButton constructor)
    which creates a copy of all of Draw's property variabled in the CanvasButton instance. If renderList
    were declared as a property variable of Draw then a new renderList would be created for the CanvasButton instance
    and the drawing functions created in CanvasButton would be pushed onto that instead of the renderList that is updated in the render loop of Matter.js.
    We declare renderList as static so it is not copied into the CanvasButton instance and there is only a single renderList Array
    onto which all graphic render functions are pushed.
*/
Draw.renderList = [];

function Draw(rocketGame) {
    this.rocketGame = rocketGame;
    this.mobileScale = this.rocketGame.windowWidthDesktop/this.rocketGame.windowWidth;

    this.engine = this.rocketGame.engine;
    this.context = this.engine.render.context;
    this.$canvasContainer = $('#canvas-container');

    // for text
    this.defaultTextFont = "18px Arial";
    this.defaultTextFillStyle = 'black';
    // top, bottom, middle, alphabetic, hanging, ideographic
    this.defaultTextBaseline = 'alphabetic';    // bottom of the body of the letters
    // I've made this one up - there is no native text horizontal align but I implament it using getTextWidth
    // the property is called horizontalAlign if you want to set it yourself
    this.defaultTextHorizontalAlign = 'left';   // left, center, right

    // for line
    this.defaultLineLineWidth = 1;
    this.defaultLineStrokeStyle = 'black';

    // for polygon
    this.defaultPolygonFillStyle = 'rgba(255,0,0,1.0)';
    this.defaultPolygonLineWidth = 1;       
    this.defaultPolygonStrokeStyle = 'black';   

}
/**
*/
Draw.prototype.addToRenderList = function (renderFunc) {
    Draw.renderList.push(renderFunc);
    //console.log(Draw.renderList.length);
    return renderFunc;
};
/**
    Stops the drawing of the line or text or object by removing the drawing function from the renderList
*/
Draw.prototype.stopDraw = function (renderFunc) {
    var thisIndex = Draw.renderList.indexOf(renderFunc);
    if(thisIndex !== -1) {
        Draw.renderList.splice(thisIndex, 1);
    } else {
        console.log("removeFromRenderList: function not found on renderList");
    }
};
/**
    Called in the render loop of matter.js every frame
*/
Draw.prototype.update = function () {
    Draw.renderList.forEach( function(renderItem) { renderItem.call(); });
};
/**
    Optional options  {offset: true, font: "18px Arial", fillStyle: 'red', horizontalAlign: 'center', textBaseline: 'bottom'}
    offset: true/false - whether the drawing is done offset for the canvas scroll or not 
            offset so it appears stationary on the screen.
    returns a function added to the renderList
*/
 var oldOffset;
Draw.prototype.drawText = function (text, left, bottom, options) {

    var self = this;
    var thisFunc = function () {
        var xOffset = 0;
        if(options && options.offset || true)   
            //xOffset = self.$canvasContainer.position().left * self.mobileScale;
            xOffset = self.rocketGame.animOffset;

        self.context.font = options && options.font || self.defaultTextFont;
        self.context.fillStyle = options && options.fillStyle || self.defaultTextFillStyle;
        self.context.textBaseline = options && options.textBaseline || self.defaultTextBaseline;

        // my imlamentation of horizontal align
        var thisHorizontalAlign = options && options.horizontalAlign || self.defaultTextHorizontalAlign;
        var horizOffset;
        var textWidth = self.getTextWidth(text);
        switch(thisHorizontalAlign) {
            case 'left': horizOffset = 0; break;
            case 'center': horizOffset = textWidth/2; break;
            case 'right': horizOffset = textWidth; break;
            default: horizOffset = 0;
            }

        self.context.fillText(text, left - xOffset - horizOffset, bottom);

    };
    this.addToRenderList(thisFunc);
    return thisFunc;
};
/**
    from:   {x:3, y:6}
    to:     {x:5, y:8}
    Optional options: {offset: true, lineWidth: 3, strokeStyle: 'blue'}
    offset: true/false - whether the drawing is done offset for the canvas scroll or not 
            offset so it appears stationary on the screen.
    returns a function that has been added to the renderList
*/
Draw.prototype.drawLine = function (from, to, options) {
    var self = this;
   
    var thisFunc = function () {
        var xOffset = 0;
        if(options && options.offset || true)   
            //xOffset = self.$canvasContainer.position().left * self.mobileScale;
            xOffset = self.rocketGame.animOffset;

        self.context.beginPath();
        self.context.moveTo(from.x - xOffset, from.y);
        self.context.lineTo(to.x - xOffset, to.y);
        self.context.closePath();

        self.context.lineWidth = options && options.lineWidth || self.defaultLineLineWidth;
        self.context.strokeStyle = options && options.strokeStyle  || self.defaultLineStrokeStyle;
        self.context.stroke();
    };
    this.addToRenderList(thisFunc);
    return thisFunc;
};
/*
    Optional options: {offset: true, fillStyle: 'yellow', lineWidth: 3, strokeStyle: 'blue'}
    offset: true/false - whether the drawing is done offset for the canvas scroll or not 
            offset so it appears stationary on the screen.
    returns a function that has been added to the renderList
*/
Draw.prototype.drawRectangle = function (x, y, width, height, options) {
    return this.drawPolygon([{x: x, y: y}, {x: x + width, y: y}, {x: x + width, y: y + height}, {x: x, y: y + height}], options);
};
/**
    vertices [{x: x1, y: y1}, {x: x2, y: y2},...]
    Optional options: {offset: true, fillStyle: 'yellow', lineWidth: 3, strokeStyle: 'blue'}
    offset: true/false - whether the drawing is done offset for the canvas scroll or not 
        offset so it appears stationary on the screen.
    returns a function that has been added to the renderList
*/
Draw.prototype.drawPolygon = function (vertices, options) {

    var self = this;
    var thisFunc = function () {
        var xOffset = 0;
        if(options && options.offset || true)   
            //xOffset = self.$canvasContainer.position().left * self.mobileScale;
            xOffset = self.rocketGame.animOffset;
            
        self.context.beginPath();
        self.context.moveTo(vertices[0].x - xOffset, vertices[0].y);
        for (var j = 1; j < vertices.length; j++) {
            self.context.lineTo(vertices[j].x - xOffset, vertices[j].y);
        }
        self.context.closePath();

        // usefull venacular
        // if options was undefined then options.fillStyle would throw a runtime error.
        // To avoid this we need to use the form options && options.fillStyle, either being undefined causes the default to be used
        // and avoids the error at runtime.
        self.context.fillStyle = options && options.fillStyle || self.defaultPolygonFillStyle;
        self.context.lineWidth = options && options.lineWidth || self.defaultPolygonLineWidth;       
        self.context.strokeStyle = options && options.strokeStyle || self.defaultPolygonStrokeStyle;   

        self.context.fill();
        self.context.stroke();
    }

    this.addToRenderList(thisFunc);
    return thisFunc;
};
/**
    Only width is availiable apparently
*/
Draw.prototype.getTextWidth = function (text) {
    return this.context.measureText(text).width;
};
/*
*/
Draw.buffer = [];
Draw.prototype.smooth = function (bufferMaxLen, num) {
    var bufferLen;
    var n, sum;

    Draw.buffer.push(num);
    bufferLen = Draw.buffer.length;

    if( bufferLen > bufferMaxLen) {
        Draw.buffer.shift();
        bufferLen = bufferMaxLen;
    }
    

    sum = 0;
    for( n = 0 ; n < bufferLen; n++)
        sum += Draw.buffer[n];

    return sum/bufferLen; 
};











