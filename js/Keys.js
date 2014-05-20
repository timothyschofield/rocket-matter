/*
*/
    Keys.KEYDOWN = "keydown";
    Keys.KEYUP = "keyup";
    Keys.theseKeysDown = {
        'Up': false,
        'Down': false,
        'Right': false,
        'Left': false,
        'M': false,
        'Fire': false
    };

    function Keys() {

        var self = this;

        document.addEventListener('keyup', function (eventData) {
            var thisKeyUp = self.getKeyFromKeycode(eventData.keyCode);

            // if it is a recognized action
            if(thisKeyUp) {
                Keys.theseKeysDown[thisKeyUp] = false;
                self.dispatchGameEvent(Keys.KEYUP);
            }
        });
       

        document.addEventListener('keydown',  function (eventData) {
            var thisKeyDown = self.getKeyFromKeycode(eventData.keyCode);

            // if it is a recognized action
            if(thisKeyDown) {

                // if it was not already down
                if(!Keys.theseKeysDown[thisKeyDown]) {
                    Keys.theseKeysDown[thisKeyDown] = true;
                    self.dispatchGameEvent(Keys.KEYDOWN);
                }
            }
        });
      

    } // eo constructor
    Keys.prototype = Object.create(EventDispatcher.prototype);
    Keys.prototype.constructor = Keys;
    /*
     */
    Keys.prototype.getKeyFromKeycode = function (keyCode) {
        var thisAction;
        switch (keyCode) {

            case 38: thisAction = 'Up'; break;          // arrow up
            case 40: thisAction = 'Down'; break;        // arrow down
            case 39: thisAction = 'Right'; break;       // arrow right
            case 37: thisAction = 'Left'; break;        // arrow left
            case 77: thisAction = 'M'; break;           // m or M
            case 32: thisAction = 'Fire'; break;        // space bar
            default:
        }

        return thisAction;
    };
    /*
     */
    Keys.prototype.getKeysDown = function () {
        return Keys.theseKeysDown;
    };
    /*
     */
Keys.prototype.removeKeyListeners = function () {
    document.removeEventListener('keyup', this.keyupCallback);
    document.removeEventListener('keydown', this.keydownCallback);
};

