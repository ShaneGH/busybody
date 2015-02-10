Class("obsjs.array", function () {
    
    var array = objjs.object.extend.call(Array, function array (initialValues) {
        
        Array.call(this);
        
        if (arguments.length)
            if (!(arguments[0] instanceof Array))
                throw "The initial values must be an array";
        
        this.$disposables = [];
        this.$boundArrays = [];
        this.$callbacks = [];
        this.$changeBatch = [];
        this.$length = initialValues ? initialValues.length : 0;    
        
        if (initialValues)
            for(var i = 0, ii = initialValues.length; i < ii; i++)
                this[i] = initialValues[i]; // doing it this way as it will not publish changes
    });
    
    array.prototype._super = objjs.object.prototype._super;
    array.extend = objjs.object.extend;
         
    array.prototype.onNextArrayChange = function (callback) {

        var cb = (function (changes) {
            if (!cb) return;
            for (var i = 0, ii = changes.length; i < ii; i++) {
                if (changes[i].type === "splice" || !isNaN(parseInt(changes[i].name))) {    
                    Array.unobserve(this, cb);
                    cb = null;
                    callback(changes[i]);
                    return;
                }
            }
        }).bind(this);

        Array.observe(this, cb);
    };
         
    array.prototype.processChangeBatch = function () {
        
        var changeBatch = this.$changeBatch.slice();
        this.$changeBatch.length = 0;

        enumerateArr(obsjs.observableBase.processChanges(this.$callbacks, changeBatch), function (c) { c(); });
    };
    
    array.prototype.registerChangeBatch = function (changes) {
        
        // not interested in property changes
        for (var i = changes.length - 1; i >= 0; i--)
            if (changes[i].name && changes[i].name !== "length" && isNaN(parseInt(changes[i].name)))
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

    Object.defineProperty(array.prototype, "length", {
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

    array.prototype._init = function () {
        //TODO: dispose
        if (this.__subscription) return;
        
        this.__subscription = this.registerChangeBatch.bind(this);
        Array.observe(this, this.__subscription);
    };
    
    array.prototype.observe = function (callback, context, evaluateOnEachChange) {
        
        if (typeof arguments[0] === "string") {
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 0, this);
            return obsjs.observable.observe.apply(obsjs.observable, args);
        }
                
        this._init();

        var cb = new obsjs.callbacks.arrayCallback(callback, context, evaluateOnEachChange);
        this.$callbacks.push(cb);

        this.onNextArrayChange(function (change) {
            cb.activatingChange = change;
        });
        
        var dispose = {
            dispose: ((function (allowPendingChanges) {

                if (!dispose) return;
                dispose = null;
                
                if (allowPendingChanges)
                    this.onNextArrayChange(function (change) {
                        cb.deactivatingChange = change;
                    });
                else
                    cb.activated = false;
            }).bind(this))
        };
        
        this.$disposables.push(dispose);
        
        return dispose;
    };
    
    array.prototype.alteringLength = function(callback) {
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

    array.copyAll = function (from, to, convert) {
        
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
    
    array.prototype.bind = function(anotherArray) {
        if (!(anotherArray instanceof wipeout.obs.array && anotherArray.__woBag.watched.boundArrays.value(this)))
            array.copyAll(this, anotherArray);
        
        return this.__woBag.watched.bindArray(anotherArray);
    };
    
    array.prototype.dispose = function() {
        
        if (this.__subscription) {
            Array.unobserve(this, this.__subscription);
            delete this.__subscription;
        }
        
        enumerateArr(this.$disposeables, function (d) {
            d.dispose();
        });
        
        this.$disposeables.length = 0;        
        this.$boundArrays.length = 0;
        this.$callbacks.length = 0;
    };
    
    return array;
});