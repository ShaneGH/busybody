// name is subject to change

Class("obsjs.observeTypes.pathObserver", function () {
    
    var observable = obsjs.observable;
    
    var pathObserver = observable.extend(function pathObserver (forObject, property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged) {
        ///<summary>Observe a property for change. Should be "call()"ed with this being a "watched"</summary>
        ///<param name="forObject" type="obsjs.observable" optional="false">The object to watch</param>
        ///<param name="property" type="String" optional="false">The property</param>
        ///<param name="callback" type="Function" optional="false">The callback for property change</param>
        ///<param name="context" type="Any" optional="true">The context of the callback</param>
        ///<param name="evaluateOnEachChange" type="Boolean" optional="true">If set to true, will fire callback each time the property changes, rather than once, for the last time the property changed</param>
        ///<param name="evaluateIfValueHasNotChanged" type="Boolean" optional="true">If set to true, will fire callback if the new value is the same as the old value</param>
        
        this._super();
        
        this.forObject = forObject;
        this.property = property;
        this.callback = callback;
        this.context = context;
        this.evaluateOnEachChange = evaluateOnEachChange;
        this.evaluateIfValueHasNotChanged = evaluateIfValueHasNotChanged;
        
        this.path = obsjs.utils.obj.splitPropertyName(property);
        
        this.disposables = new Array(this.path.length);
        this.val = obsjs.utils.obj.getObject(property, forObject);
        
        this.buildObservableChain();
        this.init = true;
        
        this.observe("val", callback, context || forObject, evaluateOnEachChange, evaluateIfValueHasNotChanged);
    });
    
    //TODO test
    pathObserver.prototype.onValueChanged = function (callback, evaluateImmediately) {
        var obs = this.observe("val", callback); 
        this.registerDisposable(obs);
        if (evaluateImmediately) callback(undefined, this.val);
        return obs;
    };
    
    pathObserver.prototype.execute = function () {
        
        var current = this.forObject;
        
        // get item at index "begin"
        for (i = 0, ii = this.path.length; current != null && i < ii; i++) {
            current = current[this.path[i]];
        }
        
        return current;
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
            if (observable.canObserve(current) && current[this.path[i]] && i >= begin) {
                
                var args = [current, (function (i) {
                    return function(oldVal, newVal) {
                        _this.buildObservableChain(i);
                        _this.val = obsjs.utils.obj.getObject(_this.property, _this.forObject);
                    };
                }(i))];
                
                var method = observable.tryObserve;
                if (isNaN(this.path[i])) {
                    args.splice(1, 0, this.path[i]);
                } else {
                    //TODO: this method does not exist
                    method = observable.tryObserveArray;
                }
                
                this.disposables[i] = method.apply(null, args);
            }

            current = current[this.path[i]];
        }
        
        // observe last item in path
        if (observable.canObserve(current))
            this.disposables[i] = observable.tryObserve(current, this.path[i], function (oldVal, newVal) {
                this.val = newVal;
            }, this);
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