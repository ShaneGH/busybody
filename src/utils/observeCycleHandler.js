// name is subject to change
//TODO: before/after observe cycle for specific object
Class("busybody.utils.observeCycleHandler", function () {
        
    var observeCycleHandler = busybody.observable.extend(function observeCycleHandler () {
		///<summary>Control observe cycles<summary>
		
        this._super();
        
		///<summary type="[Function]">Callbacks to execute before<summary>
        this.$afterObserveCycles = [];
		
		///<summary type="[Function]">Callbacks to execute after<summary>
        this.$beforeObserveCycles = [];
		
		///<summary type="Number">Current active cycles<summary>
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
		///<summary>Execute an obsder cycle<summary>
		///<param name="forObject" type="Any">The object<param>
		///<param name="executionLogic" type="FUnction">The logic<param>
		
		try {
			this.before(forObject);
			executionLogic();
		} finally {
        	this.after(forObject);
		}
	};

    function ex(callback) { callback(); }
    observeCycleHandler.prototype.before = function (forObject) {
		///<summary>Signal an observe cycle for an object has begun<summary>
		///<param name="forObject" type="Any">The object<param>
		
        if (forObject === this) return;
        
        if (this.length === 0)
            enumerateArr(this.$beforeObserveCycles.slice(), ex);
            
        this.length++;
    };
    
    observeCycleHandler.prototype.clear = function () {
		///<summary>Signal all observe cycles have ended<summary>
		
        if (this.length > 0) this.length = 0;
    };

    observeCycleHandler.prototype.after = function (forObject) {
		///<summary>Signal an observe cycle for an object has ended<summary>
		///<param name="forObject" type="Any">The object<param>
		
        if (forObject === this || this.length <= 0) return;
        
        this.length--;
    };

    observeCycleHandler.prototype.afterObserveCycle = function (callback) {
		///<summary>Execute after each observe cycle<summary>
		///<param name="callback" type="Function">The callback to execute<param>
		///<returns type="busybody.disposable">The dispose callback<param>

        return busybody.utils.obj.addWithDispose(this.$afterObserveCycles, callback);
    };

    observeCycleHandler.prototype.beforeObserveCycle = function (callback) {
		///<summary>Execute before each observe cycle<summary>
		///<param name="callback" type="Function">The callback to execute<param>
		///<returns type="busybody.disposable">The dispose callback<param>

        return busybody.utils.obj.addWithDispose(this.$beforeObserveCycles, callback);
    };

    observeCycleHandler.prototype.dispose = function () {
		///<summary>Dispose of this<summary>

		this._super();
		
        this.$afterObserveCycles.length = 0;
        this.$beforeObserveCycles.length = 0;
    };
    
    observeCycleHandler.instance = new observeCycleHandler();
    
    return observeCycleHandler;
});