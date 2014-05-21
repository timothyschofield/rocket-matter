/**

An in-canvas button

Optional options look like this:

    this.defaultButtonBgOptions = { fillStyle: 'red', lineWidth: 3, strokeStyle: 'black'};
    this.defaultButtonTextOptions = { text: "Fire!", fillStyle: 'black', font: "18px Arial"};
    this.defaultButtonOptions = 
            {
            callback: function () { console.log("This button has no callback"); },
            offset: true,
            buttonBgOptions: this.defaultButtonBgOptions,
            buttonTextOptions: this.defaultButtonTextOptions
            }
    
*/
function CanvasButton(rocketWorld, x, y, width, height, options) {

    this.rocketWorld = rocketWorld;
    this.render = this.rocketWorld.render;
	// out of date
    // instanciates Draw's properties on "this", the CanvasButton instance. 
    // so Draw's properties are initalised here, in the CanvasButton constructor.
    // Functions inherited from Draw will probably use them.
    // this.rocketWorld is passed as an argument because the Draw constructor expects that.
    //Draw.call(this, this.rocketWorld); 

    this.x = x;
    this.y = y
    this.width = width;
    this.height = height;

    this.defaultMousedownCallback = function () { console.log("This button has no mousedown callback"); return true; };
    this.defaultMouseupCallback = function () { console.log("This button has no mouseup callback"); return true; };
    this.defaultMousemoveCallback = function () { console.log("This button has no mousemove callback"); return true; };

    this.defaultOffset = true;  // if the button scrolls with the canvas or not
    
    // The text on the button
    this.defaultText = "Button";
    this.defaultTextFont = "18px Arial";
    this.defaultTextFillStyle = 'black';
    this.defaultTextBaseline = 'middle';    // makes vertical centering on the button background possible (since we can't get the height of text in pixels)
    this.defaultTextHorizontalAlign = 'center';     // My implamentation - see Draw
    this.defaultButtonTextOptions = { 
        text: this.defaultText, 
        fillStyle: this.defaultTextFillStyle, 
        font: this.defaultTextFont, 
        textBaseline: this.defaultTextBaseline,
        horizontalAlign: this.defaultTextHorizontalAlign
    };

    // for the button background
    this.defaultBgFillStyle = 'rgba(255, 0, 0, 1.0)';
    this.defaultBgLineWidth = 1;
    this.defaultBgStrokeStyle = 'black'; 
    this.defaultButtonBgOptions = {
        fillStyle: this.defaultBgFillStyle, 
        lineWidth: this.defaultBgLineWidth, 
        strokeStyle: this.defaultBgStrokeStyle
    };

    this.defaultButtonOptions = {
        mousedownCallback: this.defaultMousedownCallback,
        mouseupCallback: this.defaultMouseupCallback,
        mousemoveCallback: this.defaultMousemoveCallback,
        offset: this.defaultOffset,
        buttonBgOptions: this.defaultButtonBgOptions,
        buttonTextOptions: this.defaultButtonTextOptions
     };


    if(options) {
        // must be an easyier way to do this?
        // make copies so we don't change the defaults
        var tempDefaultButtonBgOptions = $.extend({}, this.defaultButtonBgOptions);
        var tempDefaultButtonTextOptions = $.extend({}, this.defaultButtonTextOptions);

        options.mousedownCallback = options.mousedownCallback || this.defaultMousedownCallback;
        options.mouseupCallback = options.mouseupCallback || this.defaultMouseupCallback;
        options.mousemoveCallback = options.mousemoveCallback || this.defaultMousemoveCallback;

        options.offset = options.offset || this.defaultOffset;
        options.buttonBgOptions = options.buttonBgOptions && $.extend(tempDefaultButtonBgOptions, options.buttonBgOptions) || this.defaultButtonBgOptions;
        options.buttonTextOptions = options.buttonTextOptions && $.extend(tempDefaultButtonTextOptions, options.buttonTextOptions) || this.defaultButtonTextOptions;

    } else {
        options = this.defaultButtonOptions;
    }

    this.mousedownCallback = options.mousedownCallback;
    this.mouseupCallback = options.mouseupCallback;
    this.offset = options.offset;

    var buttonBgOptions = options.buttonBgOptions;
    buttonBgOptions.offset = this.offset;
    if(this.thisBg) this.render.stopDraw(this.thisBg);
    this.thisBg = this.render.drawRectangle(this.x, this.y, this.width, this.height, buttonBgOptions);

    var buttonTextOptions = options.buttonTextOptions;
    buttonTextOptions.offset = this.offset;
    if(this.thisText) this.render.stopDraw(this.thisText);
    this.thisText = this.render.drawText(buttonTextOptions.text, this.x + this.width/2, this.y + this.height/2, buttonTextOptions);

}
CanvasButton.prototype = Object.create(EventDispatcher.prototype);
CanvasButton.prototype.constructor = CanvasButton;
/**
    event: "mousedown, 'mouseup'
    mousePos: {x:5, y:6}
*/
CanvasButton.prototype.on = function (event, mousePos) {
    if( this.mouseInside(mousePos) ) {
        var thisCallback = this[event + "Callback"];
        if(thisCallback) {
            return thisCallback.call(); // should always return true
        }
        return false; // no callback of that type
    }
    return false; // outside button
};
/**
*/
CanvasButton.prototype.mouseInside = function (mousePos) {
    var mouseX = mousePos.x;
    var mouseY = mousePos.y;
    if(this.offset) mouseX += this.rocketWorld.animOffset;

    return mouseX >= this.x && mouseX <= this.x + this.width && mouseY >= this.y && mouseY <= this.y + this.height;
};