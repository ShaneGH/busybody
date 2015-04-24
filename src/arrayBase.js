Class("busybody.arrayBase", function () {
        
    var arrayBase = orienteer.extend.call(Array, function arrayBase (initialValues) {
		///<summary>A base for arrays using or not using Object.observe</summary>
		///<param name="initialValues" type="[Any]">Initial values for the array</param>
        
        Array.call(this);
        
        if (arguments.length)
            if (!(arguments[0] instanceof Array))
                throw "The initial values must be an array";
        
		///<summary type="[busybody.disposable]">Items to despose of with this</summary>
        this.$disposables = [];
		
		///<summary type="[Array]">Arrays which are obund to this</summary>
        this.$boundArrays = [];
		
		///<summary type="[busybody.callbacks.arrayCallback]">On change callbacks</summary>
        this.$callbacks = [];
		
		///<summary type="[Object]">The current change batch</summary>
        this.$changeBatch = [];
		
		///<summary type="Number">The length property of an array base is dynamic. $length is the cached value. You can use this value, but do not write to it</summary>
        this.$length = initialValues ? initialValues.length : 0;    
        
        if (initialValues)
            for(var i = 0, ii = initialValues.length; i < ii; i++)
                this[i] = initialValues[i]; // doing it this way as it will not publish changes
    });
    
    arrayBase.prototype._super = orienteer.prototype._super;
    arrayBase.extend = orienteer.extend;
    
    arrayBase.isValidArrayChange = function (change) {
		///<summary>Returns whether the change is to the array elements or an array property</summary>
		///<param name="change" type="Object">The change</param>
		///<returns type="Boolean">Result</returns>
		
        return change.type === "splice" || !isNaN(parseInt(change.name));
    };
         
    arrayBase.prototype.onNextArrayChange = function (callback) {
		///<summary>Fire a callback once, the next array change</summary>
		///<param name="callback" type="Function">The callback</param>
        
        throw "Abstract methods must be implemented";
    };
         
    arrayBase.prototype.processChangeBatch = function () {
		///<summary>Process the current batch of changes</summary>
        
        var changeBatch = this.$changeBatch.slice();
        this.$changeBatch.length = 0;

        busybody.utils.observeCycleHandler.instance.execute(this, (function () {
        	enumerateArr(busybody.observableBase.processChanges(this.$callbacks, changeBatch), function (c) { c(); });
		}).bind(this));
    };
    
    arrayBase.prototype.registerChangeBatch = function (changes) {
		///<summary>Register a batch of changes to this array</summary>
		///<param name="changes" type="[Object]">The changes</param>
        
        // not interested in property changes
        for (var i = changes.length - 1; i >= 0; i--)
            if (!arrayBase.isValidArrayChange(changes[i]))
                changes.splice(i, 1);
        
        return busybody.observableBase.prototype.registerChangeBatch.call(this, changes);
    };
            
    function changeIndex(index) {
        if (typeof index === "number" && index % 1 === 0) {
            return index;
        } else if (index === null) {
            return 0;
        } else if (typeof index === "boolean") {
            return index ? 1 : 0;
        } else if (typeof index === "string" && !isNaN(index = parseFloat(index)) && index % 1 === 0) {
            return index;
        }

        return undefined;
    }

    Object.defineProperty(arrayBase.prototype, "length", {
        set: function(v) {
            if ((v = changeIndex(v)) === undefined) 
                throw RangeError("Invalid array length");

            if (v === this.$length)
                return;

            if(!this.__alteringArray) {
                if(v > this.$length) {
                    var args = new Array(v - this.length + 2);
                    args[0] = this.length;
                    args[1] = 0;
                    this.splice.apply(this, args);
                } else if(v < this.$length) {
                    this.splice(v, this.length - v);
                }
            }
			
            this.$length = v;
        },
        get: function() {
            return this.$length;
        }
    });

    arrayBase.prototype._init = function () {
		///<summary>Begin observing</summary>
		
        throw "Abstract methods must be implemented";
    };
    
    arrayBase.prototype.observe = function (callback, context, options) {
		///<summary>Observe for array changes</summary>
		///<param name="callback" type="Function">The callback</param>
		///<param name="context" type="Any">The "this" value in the callback</param>
		///<param name="options" type="Object" optional="true">Options on when the callback is executed and what it's args will be</param>
		///<param name="options.useRawChanges" type="Boolean">Default: false. Use the change objects from the Array.observe as arguments</param>
		///<param name="options.evaluateOnEachChange" type="Boolean">Default: false. Evaluate once for each change rather than on an amalgamation of changes</param>
		///<returns type="busybody.disposable">A disposable</returns>
		
        if (typeof arguments[0] === "string") {			
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 0, this);
            return busybody.observe.apply(null, args);
        }
		
		return this.addCallback(new busybody.callbacks.arrayCallback(callback, context, options));
    };
	
	arrayBase.prototype.disposableFor = function (changeCallback) {
		///<summary>Create an object to dispose of a changeCallback</summary>
		///<param name="changeCallback" type="busybody.callbacks.arrayCallback">The callback</param>
		///<returns type="Object">A disposable</returns>
		
		var dispose = {
			dispose: (function (allowPendingChanges) {

				if (!dispose) return;
				dispose = null;

				if (allowPendingChanges)
					this.onNextArrayChange(function (change) {
						changeCallback.deactivate(change);
					});
				else
					changeCallback.deactivate();
			}).bind(this)
		};
		
		return dispose;
	};
    
	var boundArrayStopKey = "busybody-do-not-apply-to";
    arrayBase.prototype.alteringArray = function(method, args) {
		///<summary>Execute logic which will alter this array. Apply changes to any bound arrays.</summary>
		///<param name="method" type="String">A method pointer which will alter the array</param>
		///<param name="args" type="Array">The arguments to the method</param>
				
        if (this.__alteringArray)
            throw "Calls to alteringArray must be synchronus and not nested.";
			
		try {
			this.__alteringArray = true;
			
			enumerateArr(this.$boundArrays, function (array) {
				if (array[boundArrayStopKey])
					throw "Circular reference in array bindings found";
				
				if (this[boundArrayStopKey] === array) return;
								
				array[boundArrayStopKey] = this;
				array[method].apply(array, args);
			}, this);
			
			return Array.prototype[method].apply(this, args);
		} finally {
			this.__alteringArray = false;
			enumerateArr(this.$boundArrays, function (array) {
				delete array[boundArrayStopKey];
			});
		}
    };

    arrayBase.copyAll = function (from, to, convert) {
		///<summary>Copy the contents of one array to another</summary>
		///<param name="from" type="Array">The from array</param>
		///<param name="to" type="Array">The to array</param>
		///<param name="convert" type="Function">A function to convert values before copy</param>
        
        var args;
        if (convert) {
            args = [];
            enumerateArr(from, function (item) {
                args.push(convert(item));
            });
        } else {
            args = from.slice();
        }
        
        args.splice(0, 0, 0, to.length);
        to.splice.apply(to, args);
    };
    
    arrayBase.prototype.bind = function(anotherArray) {
		///<summary>Bind arrays</summary>
		///<param name="anotherArray" type="Array">The other array</param>
		///<returns type="busybody.disposable">A disposable</returns>
        
        if (!anotherArray || this.$boundArrays.indexOf(anotherArray) !== -1) return;
		
		this.$boundArrays.push(anotherArray);
        
        if (!(anotherArray instanceof busybody.array) || anotherArray.$boundArrays.indexOf(this) === -1)
            arrayBase.copyAll(this, anotherArray);
		
		return new busybody.disposable((function () {
			if (!anotherArray) return;
			var i;
			if ((i = this.$boundArrays.indexOf(anotherArray)) !== -1)
				this.$boundArrays.splice(i, 1);
			
			anotherArray = null;
		}).bind(this));
    };
	
	arrayBase.prototype.addCallback = function (callback) {
		///<summary>Add an array callback</summary>
		///<param name="callback" type="busybody.callbacks.arrayCallback">The callback</param>
		///<returns type="busybody.disposable">A disposable</returns>
		
        this._init();

        this.$callbacks.push(callback);

        this.onNextArrayChange(function (change) {
            callback.activate(change);
        });
        
        var dispose = this.disposableFor(callback);
        
        this.$disposables.push(dispose);
        
        return dispose;
	};
    
    arrayBase.prototype.dispose = function() {
		///<summary>Dispose of the array</summary>
		
        enumerateArr(this.$disposables, function (d) {
            d.dispose();
        });
        
        this.$disposables.length = 0;        
        this.$boundArrays.length = 0;
        this.$callbacks.length = 0;
    };
    
    return arrayBase;
});