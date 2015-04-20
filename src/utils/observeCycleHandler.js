// name is subject to change
//TODO: before/after observe cycle for specific object
Class("busybody.utils.observeCycleHandler", function () {
        
    var observeCycleHandler = busybody.observable.extend(function observeCycleHandler () {
        this._super();
        
        this.$afterObserveCycles = [];
        this.$beforeObserveCycles = [];
        this.length = 0;
        
        this.observe("length", function (oldVal, newVal) {
            if (newVal === 0)
                enumerateArr(this.$afterObserveCycles.slice(), ex);
        }, this, {
			evaluateOnEachChange: false, 
			evaluateIfValueHasNotChanged: true
		});
    });
	
    observeCycleHandler.prototype.execute = function (forObject, executionLogic) {
		
		try {
			this.before(forObject);
			executionLogic();
		} finally {
        	this.after(forObject);
		}
	};

    function ex(callback) { callback(); }
    observeCycleHandler.prototype.before = function (forObject) {
        if (forObject === this) return;
        
        if (this.length === 0)
            enumerateArr(this.$beforeObserveCycles.slice(), ex);
            
        this.length++;
    };
    
    observeCycleHandler.prototype.clear = function () {
        if (this.length > 0) this.length = 0;
    };

    observeCycleHandler.prototype.after = function (forObject) {
        if (forObject === this || this.length <= 0) return;
        
        this.length--;
    };

    observeCycleHandler.prototype.afterObserveCycle = function (callback) {

        return busybody.utils.obj.addWithDispose(this.$afterObserveCycles, callback);
    };

    observeCycleHandler.prototype.befreObserveCycle = function (callback) {

        return busybody.utils.obj.addWithDispose(this.$beforeObserveCycles, callback);
    };

    observeCycleHandler.prototype.dispose = function () {

		this._super();
		
        this.$afterObserveCycles.length = 0;
        this.$beforeObserveCycles.length = 0;
    };
    
    observeCycleHandler.instance = new observeCycleHandler();
    
    return observeCycleHandler;
});