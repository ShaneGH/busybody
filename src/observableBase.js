
Class("busybody.observableBase", function () {
        
    var observableBase = busybody.disposable.extend(function observableBase(forObject) {
        ///<summary>An object whose properties can be subscribed to</summary>

        this._super();

        this.$changeBatch = [];
        this.$forObject = forObject;
        this.$callbacks = {};
    });
    
	// this function is also used by arrayBase
    observableBase.prototype.registerChangeBatch = function (changes) {
        if (!this.$changeBatch.length)
            setTimeout(this.processChangeBatch.bind(this));
        
        this.$changeBatch.push.apply(this.$changeBatch, changes);
    };
    
    observableBase.prototype.processChangeBatch = function () {
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
        throw "Abstract methods must be overridden";
    };
    
    observableBase.prototype.captureChanges = function (logic, callback, toProperty) {
		
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
        throw "Abstract methods must be overridden";
	};
    
    observableBase.prototype.bind = function (property, otherObject, otherPropoerty) {
		return busybody.bind(this, property, otherObject, otherPropoerty);
    };

    observableBase.prototype.observeArray = function (property, callback, context, options) {
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
        
		// options: evaluateOnEachChange, evaluateIfValueHasNotChanged, useRawChanges
		
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
        throw "Abstract methods must be implemented";
    };

    observableBase.prototype.dispose = function () {
        this._super();
        
        delete this.$forObject;
        for (var i in this.$callbacks)
            delete this.$callbacks[i];
    };
    
    observableBase.prototype.computed = function (property, callback, options) {
        
        var computed = new busybody.observeTypes.computed(callback, this, options);
        computed.bind(this.$forObject || this, property);
        this.registerDisposable(computed);
        return computed;        
    };
    
    observableBase.prototype.del = function (property) {
        
        delete (this.$forObject || this)[property];
    };
        
    observableBase.afterObserveCycle = function(callback) {
        return busybody.utils.observeCycleHandler.instance.afterObserveCycle(callback);
    };

    observableBase.beforeObserveCycle = function(callback) {
        return busybody.utils.observeCycleHandler.instance.beforeObserveCycle(callback);
    };

    observableBase.afterNextObserveCycle = function (callback, waitForNextCycleToStart) {

        if (busybody.utils.observeCycleHandler.instance.length === 0 && !waitForNextCycleToStart) {
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

        var dispose = busybody.utils.observeCycleHandler.instance.beforeObserveCycle(function () {
            dispose.dispose();
            callback();
        });

        return dispose;
    };
    
    return observableBase;
});