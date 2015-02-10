// name is subject to change

Class("obsjs.utils.observeCycleHandler", function () {
        
    var observeCycleHandler = obsjs.observable.extend(function observeCycleHandler () {
        this._super();
        
        this.$afterObserveCycles = [];
        this.$beforeObserveCycles = [];
        this.length = 0;
        
        this.observe("length", function (oldVal, newVal) {
            if (newVal === 0)
                enumerateArr(this.$afterObserveCycles, ex);
        }, this, false, true);
    });

    function ex(callback) { callback(); }
    observeCycleHandler.prototype.before = function (forObject) {
        if (forObject === this) return;
        
        if (this.length === 0)
            enumerateArr(this.$beforeObserveCycles, ex);
            
        this.length++;
    };

    observeCycleHandler.prototype.after = function (forObject) {
        if (forObject === this) return;
        
        this.length--;
    };

    observeCycleHandler.prototype.afterObserveCycle = function (callback) {

        return afterCycle(this.$afterObserveCycles, callback);
    };

    observeCycleHandler.prototype.befreObserveCycle = function (callback) {

        return afterCycle(this.$beforeObserveCycles, callback);
    };

    //TODO: this can be re-used a LOT!!!
    function afterCycle(callbackArray, callback) {

        callbackArray.push(callback);
        var dispose = new obsjs.disposable(function () {
            if (!dispose) return;
            dispose = null;

            callback = callbackArray.indexOf(callback);
            if (callback !== -1)
                callbackArray.splice(callback, 1);
        });

        return dispose;
    };
    
    observeCycleHandler.instance = new observeCycleHandler();
    
    return observeCycleHandler;



var observeCycleHandler = {
    length: 0,
    before: function () {
        if (observeCycleHandler.length === 0)
            observeCycleHandler.length++;
    },
    after: function () {
        observeCycleHandler.length--;
    }
};
});