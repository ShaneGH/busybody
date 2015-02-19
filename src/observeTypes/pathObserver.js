// name is subject to change

Class("obsjs.observeTypes.pathObserver", function () {
        
    var pathObserver = obsjs.utils.executeCallbacks.extend(function pathObserver (forObject, property, callback, context) {
        ///<summary>Observe a property for change. Should be "call()"ed with this being a "watched"</summary>
        ///<param name="forObject" type="obsjs.observable" optional="false">The object to watch</param>
        ///<param name="property" type="String" optional="false">The property</param>
        ///<param name="callback" type="Function" optional="false">The callback for property change</param>
        ///<param name="context" type="Any" optional="true">The context of the callback</param>
		
        this._super();
        
        this.forObject = forObject;
        this.property = property;
        this.callback = callback;
        this.context = context;
        
        this.path = obsjs.utils.obj.splitPropertyName(property);
        
        this.disposables = new Array(this.path.length);
        this.execute();
        
        this.buildObservableChain();
        this.init = true;
		
		this.callbacks = [];
		this.onValueChanged(callback.bind(context || forObject), false);
    });
    
    //TODO test
    pathObserver.prototype.onValueChanged = function (callback, evaluateImmediately) {
		obsjs.observeTypes.computed.prototype.onValueChanged.apply(this, arguments);
    };
    
    pathObserver.prototype.buildObservableChain = function (begin) {
        begin = begin || 0;
        
        // dispose of anything in the path after the change
        for (var i = begin; i < this.path.length; i++) {
            if (this.disposables[i]) {
                this.disposables[i].dispose();
                this.disposables[i] = null;
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
                
                this.disposables[i] = obsjs.tryObserve.apply(null, args);
            }

            current = current[this.path[i]];
        }
        
        // observe last item in path
        if (obsjs.canObserve(current))
            this.disposables[i] = obsjs.tryObserve(current, this.path[i], function (oldVal, newVal) {
                this.throttleExecution();
            }, this);
    };
        
	//TODO: (partially) copy pasted from computed
    pathObserver.prototype._execute = function() {
		var oldVal = this.val;
		
        var current = this.forObject;
        
        // get item at index "begin"
        for (i = 0, ii = this.path.length; current != null && i < ii; i++) {
            current = current[this.path[i]];
        }
		
		this.val = i === ii ? current : null;
				
		return {
			cancel: this.val === oldVal,
			arguments: [oldVal, this.val]
		};
    };
	
    pathObserver.prototype.dispose = function () {
        this._super();
        
        for (var i = 0, ii = this.disposables.length; i < ii && this.disposables[i]; i++)
            if (this.disposables[i]) {
                this.disposables[i].dispose();
                this.disposables[i] = null;
            }

        this.disposables.length = 0;
    };
                                      
    return pathObserver;
});