/*
    Creates a BlockWorld for Blocks

*/
function BlockWorld(world) {

    this.world = world;
    this.defaultWorld = {"objects":[{"id":"id1","rectangle":{"left":-50,"top":-40,"width":1700,"height":50},"cssOptions":{"background-color":"green","border":"1px solid black"},"physicalOptions":{"frictionAir":0,"friction":0.1,"isStatic":true}},{"id":"id2","rectangle":{"left":-50,"top":460,"width":1700,"height":50},"cssOptions":{"background-color":"green","border":"1px solid black"},"physicalOptions":{"frictionAir":0,"friction":0.1,"isStatic":true}},{"id":"id3","rectangle":{"left":-40,"top":0,"width":50,"height":570},"cssOptions":{"background-color":"green","border":"1px solid black"},"physicalOptions":{"frictionAir":0,"friction":0.1,"isStatic":true}},{"id":"id4","rectangle":{"left":1590,"top":0,"width":50,"height":570},"cssOptions":{"background-color":"green","border":"1px solid black"},"physicalOptions":{"frictionAir":0,"friction":0.1,"isStatic":true}}]};
}
/**
*/
BlockWorld.prototype.init = function () {
    this.import();
};
/**
*/
BlockWorld.prototype.import = function () {

    // There is a small script loaded before the file containing the getWorld function that returns the world description.
    // The script is <script> getWorld() { return null; }; </script>
    // If the file does not exist then this script will be run and we get null back, so we know
    // to use the defaultWorld
    var thisJSON = getWorld();
    if (!thisJSON) {
        console.log("thisWorld default used");
        thisJSON = this.defaultWorld;
    }

    console.log(thisJSON);

    var numItems = thisJSON.items.length;

    var n, thisItem, thisRect;
    var cssOptions, physicalOptions

    for (n = 0; n < numItems; n++) {
        var newItem;
        thisItem = thisJSON.items[n];
        thisRect = thisItem.rect;

        switch (thisItem.type) {
            case 'rectangle':
                newItem = new Block(thisRect.left, thisRect.top, thisRect.width, thisRect.height, thisItem.cssOptions, thisItem.physicalOptions);
                break;

            case 'rocket':
                RocketGame.setRocketLocation(thisRect.left + thisRect.width/2, thisRect.top + thisRect.height/2);
                break;

            default: console.log("Unknown object type: ", thisItem.type);
        }

        if (newItem) {
            Matter.World.add(this.world, newItem.body);
        }

    }


};