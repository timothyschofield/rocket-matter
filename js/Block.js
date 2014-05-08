/**
    Creates a new Block
*/
function Block(left, top, width, height, cssOptions, physicalOptions) {
    //console.log("block ", left, top, width, height);

    this.body = Matter.Bodies.rectangle(left + width/2, top + height/2, width, height, physicalOptions); 

}
/*
*/
Block.prototype.init = function () {
}