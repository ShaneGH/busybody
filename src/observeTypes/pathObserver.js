// name is subject to change

Class("obsjs.observeTypes.pathObserver", function () {
        
    var pathObserver = obsjs.observeTypes.observeTypesBase.extend(function pathObserver (forObject, property, callback, context) {
        ///<summary>Observe a property for change. Should be "call()"ed with this being a "watched"</summary>
        ///<param name="forObject" type="obsjs.observable" optional="false">The object to watch</param>
        ///<param name="property" type="String" optional="false">The property</param>
        ///<param name="callback" type="Function" optional="true">A callback for property change</param>
        ///<param name="context" type="Any" optional="true">The context of the callback</param>
		
        this._super();
        
        this.forObject = forObject;
        this.property = property;
        
        this.path = obsjs.utils.obj.splitPropertyName(property);
        
        this.__pathDisposables = new Array(this.path.length);
        this.execute();
        
        this.buildObservableChain();
        this.init = true;
		
		this.callbacks = [];
		if (callback)
			this.onValueChanged(callback.bind(context || forObject), false);
    });
    
    pathObserver.prototype.onValueChanged = function (callback, evaluateImmediately) {
              
		var output = this.addCallback(callback);		
        if (evaluateImmediately)
            callback(undefined, this.val);
		
        return output;
    };
    
    pathObserver.prototype.buildObservableChain = function (begin) {
        begin = begin || 0;
        
        // dispose of anything in the path after the change
        for (var i = begin; i < this.path.length; i++) {
            if (this.__pathDisposables[i]) {
                this.__pathDisposables[i].dispose();
                this.__pathDisposables[i] = null;
            }
        }

        var current = this.forObject, _this = this;
        
        // get item at index "begin"
        for (i = 0; current && i < begin; i++) {
            current = current[this.path[i]];
        }
        
        // get the last item in the path subscribing to changes along the way
        for (; current && i < this.path.length - 1; i++) {
            if ((obsjs.canObserve(current) || current instanceof obsjs.array) && current[this.path[i]] && i >= begin) {
                
                var args = [current, (function (i) {
                    return function(oldVal, newVal) {
                        _this.buildObservableChain(i);
						_this.throttleExecution();
                    };
                }(i))];
                
                if (isNaN(this.path[i])) {
                    args.splice(1, 0, this.path[i]);
                }
                
                this.__pathDisposables[i] = obsjs.tryObserve.apply(null, args);
            }

            current = current[this.path[i]];
        }
        
        // observe last item in path
        if (obsjs.canObserve(current))
            this.__pathDisposables[i] = obsjs.tryObserve(current, this.path[i], function (oldVal, newVal) {
                this.throttleExecution();
            }, this);
    };
        
    pathObserver.prototype.getValue = function() {
        var current = this.forObject;
        
        // get item at index "begin"
        for (i = 0, ii = this.path.length; current != null && i < ii; i++) {
            current = current[this.path[i]];
        }
		
		return i === ii ? current : null;
    };
	
    pathObserver.prototype.dispose = function () {
        this._super();
        
        for (var i = 0, ii = this.__pathDisposables.length; i < ii && this.__pathDisposables[i]; i++)
            if (this.__pathDisposables[i])
                this.__pathDisposables[i].dispose();

        this.__pathDisposables.length = 0;
    };
                                      
    return pathObserver;
});