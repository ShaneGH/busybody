Class("obsjs.array", function () {
        
    var useObjectObserve = wipeout.obs.watched.useObjectObserve;
    
    var array = objjs.object.extend.call(Array, function array (initialValues) {
        
        Array.call(this);
        
        if (arguments.length)
            if (!(arguments[0] instanceof Array))
                throw "The initial values must be an array";
        
        this.$boundArrays = [];
        this.$length = initialValues ? initialValues.length : 0;        
        this.__bindingChanges = [];
        
        if (initialValues)
            for(var i = 0, ii = initialValues.length; i < ii; i++)
                this[i] = initialValues[i]; // doing it this way as it will not publish changes
    });
    
    array.prototype._super = wipeout.base.object.prototype._super;
    array.extend = wipeout.base.object.extend;
            
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
            this.__woBag.watched.registerChange({
                name: "length",
                object: this,
                oldValue: oldValue,
                type: "update"
            });
        },
        get: function() {
            return this.__woBag ? this.$length : undefined;
        }
    });   
    
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
    
    //TODO: old implementation was not updating length.
    //TODO: use old emeplemntation, there are already tests in place
    array.prototype.replace = function(index, replacement) {
        
        /*
        if (!useObjectObserve)
            this.__woBag.watched.registerChange({
                name: index.toString(),
                object: this,
                oldValue: this[index],
                type: "update"
            });
        
        return this.alteringLength(function() {
            if (this.length <= index)
                this.length = index + 1;
                
            return this[index] = replacement;
        });*/
        
        this.splice(index, index >= this.length ? 0 : 1, replacement);
        return replacement;
    };

    array.prototype.pop = function() {

        if (!useObjectObserve)
            if (this.length)
                this.__woBag.watched.registerChange({
                    addedCount: 0,
                    index: this.length - 1,
                    object: this,
                    removed: [this[this.length - 1]],
                    type: "splice"
                });

        return this.alteringLength(function() {
            return Array.prototype.pop.call(this);
        });
    };

    array.prototype.shift = function() {

        if (!useObjectObserve)
            if (this.length)
                this.__woBag.watched.registerChange({
                    addedCount: 0,
                    index: 0,
                    object: this,
                    removed: [this[0]],
                    type: "splice"
                });

        return this.alteringLength(function() {
            return Array.prototype.shift.call(this);
        });
    };

    array.prototype.remove = function(item) {

        var i;
        if ((i = this.indexOf(item)) !== -1)
            this.splice(i, 1);
    };

    array.prototype.push = function(item) {

        if (!useObjectObserve)
            this.__woBag.watched.registerChange({
                addedCount: 1,
                index: this.length,
                object: this,
                removed: [],
                type: "splice"
            });

        return this.alteringLength(function() {
            return Array.prototype.push.call(this, item);
        });
    };

    //TODO: test
    array.prototype.reverse = function(item) {

        if (!useObjectObserve) {
                
            var half = this.length / 2;
            half = half % 1 === 0 ? -1 : half - 0.5;
            
            for (var i = 0, ii = this.length; i < ii; i++) {
                if (i === half)
                    continue;
            
                this.__woBag.watched.registerChange({
                    name: i.toString(),
                    object: this,
                    oldValue: this[i],
                    type: "update"
                });
            }
        }
        
        return this.alteringLength(function() {
            return Array.prototype.reverse.call(this);
        });
    };

    array.prototype.splice = function(index, removeCount, addItems) {
        if (!useObjectObserve) {
            var removed = [];
            for(var i = index, ii = removeCount + index > this.length ? this.length : removeCount + index; 
                i < ii; 
                i++)
                removed.push(this[i]);

            this.__woBag.watched.registerChange({
                addedCount: arguments.length - 2,
                index: index,
                object: this,
                removed: removed,
                type: "splice"
            });
        }

        var args = arguments;
        return this.alteringLength(function() {
            return Array.prototype.splice.apply(this, args);
        });
    };

    //TODO
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    
    array.prototype.observe = function (callback, context, complexCallback /*TODO*/) {
        
        if (typeof arguments[0] === "string") {
            var args = arguments.slice();
            args.splice(0, 0, this);
            return obsjs.observable.observe.apply(obsjs.observable, args);
        }
        
        throw "Not implemented exception";
    };
    
    array.prototype.dispose = function() {
        this.__bindingChanges.length = 0;
        this.$boundArrays.length = 0;
    };
    
    return array;
});