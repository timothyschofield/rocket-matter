function Util() {

    this.x = 10;
    this.lineHeight = 16;


}
Util.prototype.debug = function (lineNum, text) {
   if(this.debugText) this.render.stopDraw(this.debugText);
   this.debugText = this.render.drawText(text, this.x, lineNum * this.lineHeight, {fillStyle:'lightblue'});
};
