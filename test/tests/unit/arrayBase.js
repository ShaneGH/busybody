
module("obsjs.arrayBase", {
	setup: function() {
	},
	teardown: function() {
	}
});

testUtils.testWithUtils("placeholder", null, false, function(methods, classes, subject, invoker) {
	ok(true);
});

function a() {
    
    function dictionary () {
        this.__keyArray = [], this.__valueArray = [];        
    }
    
    dictionary.prototype.add = function (key, value) {
        var i = this.__keyArray.indexOf(key);
        i === -1 ? (this.__keyArray.push(key), this.__valueArray.push(value)) : this.__valueArray[i] = value;

        return value;
    };
    
    dictionary.prototype.clear = function () {
        this.__keyArray.length = 0;
        this.__valueArray.length = 0;        
    };
    
    dictionary.prototype.remove = function (key) {
        var i = this.__keyArray.indexOf(key);
        if (i !== -1) {
            this.__keyArray.splice(i, 0);
            this.__valueArray.splice(i, 0);
            return true;
        }            

        return false;
    };
    
    dictionary.prototype.value = function (key) {
        return this.__valueArray[this.__keyArray.indexOf(key)];
    };
    
    var arrayBase = objjs.object.extend.call(Array, function arrayBase (initialValues) {
        
        Array.call(this);
        
        if (arguments.length)
            if (!(arguments[0] instanceof Array))
                throw "The initial values must be an array";
        
        this.$disposables = [];
        this.$boundArrays = new dictionary();
        this.$callbacks = [];
        this.$changeBatch = [];
        this.$length = initialValues ? initialValues.length : 0;    
        
        if (initialValues)
            for(var i = 0, ii = initialValues.length; i < ii; i++)
                this[i] = initialValues[i]; // doing it this way as it will not publish changes
    });
    
    arrayBase.prototype._super = objjs.object.prototype._super;
    arrayBase.extend = objjs.object.extend;
    
    arrayBase.isValidArrayChange = function (change) {
        return change.type === "splice" || !isNaN(parseInt(change.name));
    };
    
    arrayBase.prototype.captureChanges = function (logic, callback) {
        throw "Abstract methods must be overridden";
    };
         
    arrayBase.prototype.onNextArrayChange = function (callback) {
        
        throw "Abstract methods must be implemented";
    };
         
    arrayBase.prototype.processChangeBatch = function () {
        
        var changeBatch = this.$changeBatch.slice();
        this.$changeBatch.length = 0;

        //TODO: copy pasted from observableBase
        obsjs.utils.observeCycleHandler.instance.before(this);
        enumerateArr(obsjs.observableBase.processChanges(this.$callbacks, changeBatch), function (c) { c(); });
        obsjs.utils.observeCycleHandler.instance.after(this);
    };
    
    arrayBase.prototype.registerChangeBatch = function (changes) {
        
        // not interested in property changes
        for (var i = changes.length - 1; i >= 0; i--)
            if (!arrayBase.isValidArrayChange(changes[i]))
                changes.splice(i, 1);
        
        return obsjs.observableBase.prototype.registerChangeBatch.call(this, changes);
    };
            
    function changeIndex(index) {
        if (typeof index === "number" && index % 1 === 0) {
            return index;
        } else if(index === null) {
            return 0;
        } else if (index instanceof Boolean) {
            return index ? 1 : 0;
        } else if (typeof index === "string" && !isNaN(index = parseFloat(index)) && index % 1 === 0) {
            return index;
        }

        return undefined;
    }

    Object.defineProperty(arrayBase.prototype, "length", {
        set: function(v) {
            v = changeIndex(v);            
            if (v === undefined) 
                throw RangeError("Invalid array length");

            if (v === this.$length)
                return;

            if(!this.__alteringLength) {
                if(v > this.$length) {
                    var args = new Array(v - this.length + 2);
                    args[0] = this.length;
                    args[1] = 0;
                    this.splice.apply(this, args);
                } else if(v < this.$length) {
                    this.splice(v, this.length - v);
                }
            }
            
            var oldValue = this.$length;
            this.$length = v;
        },
        get: function() {
            return this.$length;
        }
    });

    arrayBase.prototype._init = function () {
        throw "Abstract methods must be implemented";
    };
    
    arrayBase.prototype.observe = function (callback, context, options) {
        // options evaluateOnEachChange and useRawChanges		
		
        if (typeof arguments[0] === "string") {
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 0, this);
            return obsjs.observe.apply(null, args);
        }
                
        this._init();

        var cb = new obsjs.callbacks.arrayCallback(callback, context, options);
        this.$callbacks.push(cb);

        this.onNextArrayChange(function (change) {
            cb.activate(change);
        });
        
        var dispose = {
            dispose: ((function (allowPendingChanges) {

                if (!dispose) return;
                dispose = null;
                
                if (allowPendingChanges)
                    this.onNextArrayChange(function (change) {
                        cb.deactivate(change);
                    });
                else
                    cb.deactivate();
            }).bind(this))
        };
        
        this.$disposables.push(dispose);
        
        return dispose;
    };
    
    arrayBase.prototype.alteringLength = function(callback) {
        if (this.__alteringLength) {
            return callback.call(this);
        } else {
            try {
                this.__alteringLength = true;
                return callback.call(this);
            } finally {
                this.__alteringLength = false;
            }
        }
    };

    arrayBase.copyAll = function (from, to, convert) {
        
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
		
        this._init();
        
        if (this.$boundArrays.value(anotherArray)) return;        
        
        if (!(anotherArray instanceof obsjs.array && anotherArray.$boundArrays.value(this)))
            arrayBase.copyAll(this, anotherArray);
        
        this.$boundArrays.add(anotherArray, {});
        
        //TODO: copied from observe
        var cb = new obsjs.callbacks.boundArrayCallback(this, anotherArray);
        this.$callbacks.push(cb);

        this.onNextArrayChange(function (change) {
            cb.activate(change);
        });
        
        var dispose = {
            dispose: ((function (allowPendingChanges) {

                if (!dispose) return;
                dispose = null;
                
                if (allowPendingChanges)
                    this.onNextArrayChange(function (change) {
                        cb.deactivate(change);
                    });
                else
                    cb.deactivate();
            }).bind(this))
        };
        
        this.$disposables.push(dispose);
        
        return dispose;
    };
    
    arrayBase.prototype.dispose = function() {
        
        enumerateArr(this.$disposables, function (d) {
            d.dispose();
        });
        
        this.$disposables.length = 0;        
        this.$boundArrays.clear();
        this.$callbacks.length = 0;
    };
};