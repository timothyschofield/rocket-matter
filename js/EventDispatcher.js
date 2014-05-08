

    EventDispatcher.listeners = {};

    function EventDispatcher() {
    }
    /*
    */
    EventDispatcher.prototype.addGameEventListener = function (eventType, callback, context) {

        // make a new list for objects (contexts) listening to eventType
        if (typeof EventDispatcher.listeners[eventType] === "undefined") {
            EventDispatcher.listeners[eventType] = [];
        }

        // how about push(context[callback])
        EventDispatcher.listeners[eventType].push({ callback: callback, context: context });

        // returns a handle to the listener - this can be used to conveniently remove the listener
        // at a later date
        return {eventType: eventType,  callback: callback, context: context };
    };
    /*
    */
    EventDispatcher.prototype.removeGameEventListener = function (eventType, callback, context) {

        var listenersToThisEvent = EventDispatcher.listeners[eventType];
        var numListeners = listenersToThisEvent.length;
        for (var i = numListeners - 1; i >= 0; i--) {

            var thisContext = listenersToThisEvent[i].context;
            var thisCallback = listenersToThisEvent[i].callback;

            if (context === thisContext && callback === thisCallback)
                listenersToThisEvent.splice(i, 1);
        }
    };
    /*
    */
    EventDispatcher.prototype.dispatchGameEvent = function (eventType, message) {

        //console.log("In EventDispatcher.prototype.dispatchGameEvent " + eventType + " " + message);

        var listenersToThisEvent = EventDispatcher.listeners[eventType];
        if(listenersToThisEvent) {
            var numListeners = listenersToThisEvent.length;
            for (var i = 0; i < numListeners; i++) {

                var thisContext = listenersToThisEvent[i].context;
                var thisCallback = listenersToThisEvent[i].callback;

                thisCallback.call(thisContext, message);
            }
        }
    };
