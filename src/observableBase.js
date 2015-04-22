
Class("busybody.observableBase", function () {
        
    var observableBase = busybody.disposable.extend(function observableBase(forObject) {
        ///<summary>An object whose properties can be subscribed to</summary>
		///<param name="forObject" type="Object" optional="true">Observe changes to another object</param>

        this._super();

        ///<summary type="[Object]">Current changes to be processed</summary>
        this.$changeBatch = [];
		
        ///<summary type="Object">The object to observe. If null, observe this</summary>
        this.$forObject = forObject;
		
        ///<summary type="Object">Dictionary of change callbacks</summary>
        this.$callbacks = {};
    });
    
	// this function is also used by arrayBase
    observableBase.prototype.registerChangeBatch = function (changes) {
		///<summary>Register a batch of changes to this object</summary>
		///<param name="changes" type="[Object]">The changes</param>
		
        if (!this.$changeBatch.length)
            setTimeout(this.processChangeBatch.bind(this));
        
        this.$changeBatch.push.apply(this.$changeBatch, changes);
    };
    
    observableBase.prototype.processChangeBatch = function () {
		///<summary>Process the current batch of changes</summary>
		
        var splitChanges = {};
        enumerateArr(this.$changeBatch, function(change) {
            if (!splitChanges[change.name])
                splitChanges[change.name] = [];

            splitChanges[change.name].push(change);
        });
        
        this.$changeBatch.length = 0;

        busybody.utils.observeCycleHandler.instance.execute(this.$forObject || this, (function () {
			var evaluateMultiple = [];
			enumerateObj(splitChanges, function (changes, name) {
				if (this.$callbacks[name])
					evaluateMultiple.push.apply(evaluateMultiple, observableBase.processChanges(this.$callbacks[name], changes));
			}, this);

			enumerateArr(evaluateMultiple, function (c) { c(); });
		}).bind(this));
    };

    observableBase.processChanges = function (callbacks, changes) {
		///<summary>Process changes</summary>
		///<param name="callbacks" type="[busybody.callbacks.chageCallback]">The callbacks</param>
		///<returns type="[Function]">A list of items to execute after this funciton returns</returns>
		
        var dispose = [];
        var evaluateMultiple = [];
        enumerateArr(callbacks, function (callback, i) {
            if (callback.evaluateOnEachChange) {
                for (var i = 0, ii = changes.length; i < ii; i++)
                    if (callback.evaluateSingle(changes, i))
                        dispose.push(i);
            } else {
                evaluateMultiple.push(function () {
                    if (callback.evaluateMultiple(changes))
                        dispose.push(i);
                });
            }
        });

        // reverse array so that removals before will not affect array enumeration
        dispose.sort(function (a,b) { return a < b;  })
        for (var i = 0, ii = dispose.length; i < ii; i++)
            callbacks.splice(dispose[i], 1);
        
        return evaluateMultiple;
    };
    
    observableBase.prototype.onNextPropertyChange = function (property, callback) {
		///<summary>Fire a callback once, the next property change</summary>
		///<param name="property" type="String">The property to observe</param>
		///<param name="callback" type="Function">The callback</param>
		
        throw "Abstract methods must be overridden";
    };
    
    observableBase.prototype.captureChanges = function (logic, callback, toProperty) {
		///<summary>Capture all of the changes to the property perpetrated by the logic</summary>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
		///<param name="toProperty" type="String" optional="true">The property</param>
				
		if (toProperty && (toProperty = busybody.utils.obj.splitPropertyName(toProperty)).length > 1) {
			return busybody.captureChanges(
				busybody.utils.obj.getObject(toProperty.slice(0, toProperty.length - 1).join("."), this.$forObject || this), 
				logic, 
				callback, 
				toProperty[toProperty.length - 1]);
		}
		
		toProperty = toProperty && toProperty.length ? toProperty[0] : undefined;
		var cb = toProperty ? function (changes) {
			var ch = [];
			enumerateArr(changes, function (change) {
				if (change.name == toProperty)
					ch.push(change);
			});

			callback(ch);
		} : callback.bind(this);
		
		if (toProperty)
        	this._init(toProperty);
		
		return this._captureChanges(logic, cb);
    };
    
    observableBase.prototype._captureChanges = function (logic, callback, toProperty) {
		///<summary>Capture all of the changes to the property perpetrated by the logic</summary>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
		///<param name="toProperty" type="String">The property</param>
		
        throw "Abstract methods must be overridden";
	};
    
    observableBase.prototype.bind = function (property, otherObject, otherPropoerty) {
		///<summary>Bind a property to another objects property</summary>
		///<param name="property" type="String">The property</param>
		///<param name="otherObject" type="Object">The other object</param>
		///<param name="otherProperty" type="String">The other property</param>
		
		return busybody.bind(this, property, otherObject, otherPropoerty);
    };

    observableBase.prototype.observeArray = function (property, callback, context, options) {
		///<summary>Observe an array property for changes</summary>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback</param>
		///<param name="context" type="Any">The "this" value in the callback</param>
		///<param name="options" type="Object" optional="true">See busybody.array.observe for options</param>
		///<returns type="busybody.disposable">A disposable</returns>
		
        var d2, d1 = this.observe(property, function (oldValue, newValue) {
            
            if (d2) {
                this.disposeOf(d2);
                d2 = null;
            }
            
            var change = {
                object: newValue || [],
                index: 0,
                addedCount: newValue instanceof Array ? newValue.length : 0,
                removed: oldValue instanceof Array ? oldValue : [],
                type: "splice"
            };
            
            //TODO: duplication of logic
            if (options && options.evaluateOnEachChange) {
                callback.call(context, change);
            } else {
                var cec = new busybody.utils.compiledArrayChange([change], 0, 1);
                callback.call(context, cec.getRemoved(), cec.getAdded(), cec.getIndexes());
            }
            
            if (newValue instanceof busybody.array)
                d2 = this.registerDisposable(newValue.observe(callback, context, options));
        }, this);
        
        var tmp;
        if ((tmp = busybody.utils.obj.getObject(property, this.$forObject || this)) instanceof busybody.array)
            d2 = this.registerDisposable(tmp.observe(callback, context, options));
        
        return new busybody.disposable(function () {
            if (d2) {
                this.disposeOf(d2);
                d2 = null;
            }
            
            if (d1) {
                d1.dispose();
                d1 = null;
            }
        });
    }

    observableBase.prototype.observe = function (property, callback, context, options) {
		///<summary>Observe changes to a property </summary>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback to execute</param>
		///<param name="context" type="Any" optional="true">The "this" in the callback</param>
		///<param name="options" type="Object" optional="true">Options for the callback</param>
		///<param name="options.useRawChanges" type="Boolean">Default: false. Use the change objects from the Object.observe as arguments</param>
		///<param name="options.evaluateOnEachChange" type="Boolean">Default: false. Evaluate once for each change rather than on an amalgamation of changes</param>
		///<param name="options.evaluateIfValueHasNotChanged" type="Boolean">Default: false. Evaluate if the oldValue and the newValue are the same</param>
		///<param name="options.activateImmediately" type="Boolean">Default: false. Activate the callback now, meaning it could get changes which were applied before the callback was created</param>
		
        if (/[\.\[]/.test(property)) {
            var pw = new busybody.observeTypes.pathObserver(this.$forObject || this, property, callback, context);
            this.registerDisposable(pw);
            return pw;
        }
        
        this._init(property);

        var cb = new busybody.callbacks.propertyCallback(callback, context, options);
        if (!this.$callbacks[property]) this.$callbacks[property] = [];
        this.$callbacks[property].push(cb);

		if (options && options.activateImmediately)
			cb.activate();
		else
			this.onNextPropertyChange(property, function (change) {
				cb.activate(change);
			});
        
        var dispose = {
            dispose: (function (allowPendingChanges) {

                if (!dispose) return;
                dispose = null;
                
                if (allowPendingChanges)
                    this.onNextPropertyChange(property, function (change) {
                        cb.deactivate(change);
                    });
                else
                    cb.deactivate();
            }).bind(this)
        };
        
        this.registerDisposable(dispose);
        
        return dispose;
    };

    observableBase.prototype._init = function (forProperty) {
		///<summary>Begin observing a property</summary>
		///<param name="forProperty" type="String">The property</param>
		
        throw "Abstract methods must be implemented";
    };

    observableBase.prototype.dispose = function () {
		///<summary>Dispose fo this</summary>
		
        this._super();
        
        delete this.$forObject;
        for (var i in this.$callbacks)
            delete this.$callbacks[i];
    };
    
    observableBase.prototype.computed = function (property, callback, options) {
		///<summary>Create a computed which bind's to a property. The context of the callback will be this observable.</summary>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The computed logic.</param>
		///<param name="options" type="Object" optional="true">See busybody.observeTypes.computed for options</param>
		///<returns type="busybody.observeTypes.computed">The computed</param>
        
        var computed = new busybody.observeTypes.computed(callback, this.$forObject || this, options);
        computed.bind(this.$forObject || this, property);
        this.registerDisposable(computed);
        return computed;        
    };
    
    observableBase.prototype.del = function (property) {
		///<summary>Delete a property and publish changes.</summary>
		///<param name="property" type="String">The property</param>
        
        delete (this.$forObject || this)[property];
    };
        
    observableBase.afterObserveCycle = function(callback) {
		///<summary>Execute a callback after each observe cycle.</summary>
		///<param name="callback" type="Function">The callback.</param>
		///<returns type="busybody.disposable">A dispose callback</param>
		
        return busybody.utils.observeCycleHandler.instance.afterObserveCycle(callback);
    };

    observableBase.beforeObserveCycle = function(callback) {
		///<summary>Execute a callback before each observe cycle.</summary>
		///<param name="callback" type="Function">The callback.</param>
		///<returns type="busybody.disposable">A dispose callback</param>
		
        return busybody.utils.observeCycleHandler.instance.beforeObserveCycle(callback);
    };

    observableBase.afterNextObserveCycle = function (callback, waitForNextCycleToStart) {
		///<summary>Execute a callback after the next observe cycle.</summary>
		///<param name="callback" type="Function">The callback.</param>
		///<param name="waitForNextCycleToStart" type="Boolean" options="true">If false and there is no observe cycle running, will execute the callback immediately.</param>
		///<returns type="busybody.disposable">A dispose callback</param>

        if (!waitForNextCycleToStart && busybody.utils.observeCycleHandler.instance.length === 0) {
            callback();
            return;
        }

        var dispose = busybody.utils.observeCycleHandler.instance.afterObserveCycle(function () {
            dispose.dispose();
            callback();
        });

        return dispose;
    };

    observableBase.beforeNextObserveCycle = function (callback) {
		///<summary>Execute a callback before the next observe cycle.</summary>
		///<param name="callback" type="Function">The callback.</param>
		///<returns type="busybody.disposable">A dispose callback</param>

        var dispose = busybody.utils.observeCycleHandler.instance.beforeObserveCycle(function () {
            dispose.dispose();
            callback();
        });

        return dispose;
    };
    
    return observableBase;
});