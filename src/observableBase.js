
Class("obsjs.observableBase", function () {
    
    var observableBase = obsjs.disposable.extend(function observableBase(forObject) {
        ///<summary>An object whose properties can be subscribed to</summary>

        this._super();

        this.$changeBatch = [];
        this.$forObject = forObject;
        this.$callbacks = {};
    });
    
    observableBase.prototype.registerChangeBatch = function (changes) {
        if (!this.$changeBatch.length)
            setTimeout(this.processChangeBatch.bind(this));
        
        var args = changes.slice();
        args.splice(0, 0, this.$changeBatch.length, 0);
        this.$changeBatch.splice.apply(this.$changeBatch, args);
    };
    
    observableBase.prototype.processChangeBatch = function () {
        var splitChanges = {};
        enumerateArr(this.$changeBatch, function(change) {
            if (!splitChanges[change.name])
                splitChanges[change.name] = [];

            splitChanges[change.name].push(change);
        });
        
        this.$changeBatch.length = 0;

        var evaluateMultiple = [];
        enumerateObj(splitChanges, function (changes, name) {
            if (this.$callbacks[name]) {
                var dispose = [];
                enumerateArr(this.$callbacks[name], function (callback, i) {
                    if (callback.evaluateOnEachChange) {
                        for (var i = 0, ii = changes.length; i < ii; i++)
                            if (callback.evaluateSingle(changes[i], changes[i + 1]))
                                dispose.push(i);
                    } else {
                        evaluateMultiple.push(function () {
                            if (callback.evaluateMultiple(changes))
                                dispose.push(i);
                        });
                    }
                });
                
                for (var i = dispose.length - 1; i >= 0; i--)
                    this.$callbacks[name].splice(dispose[i], 1);
            }                
        }, this);

        enumerateArr(evaluateMultiple, function (c) { c(); });
    };

    observableBase.prototype.onNextPropertyChange = function (property, callback) {
        throw "Abstract methods must be overridden";
    };

    observableBase.prototype.observe = function (property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged) {
        
        if (/[\.\[]/.test(property)) {
            var pw = new obsjs.observeTypes.pathObserver(this.$forObject || this, property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged);
            this.registerDisposable(pw);
            return pw;
        }
        
        this._init(property);
        
        var cb = callback.bind(context);
        cb.evaluateOnEachChange = evaluateOnEachChange;
        cb.evaluateIfValueHasNotChanged = evaluateIfValueHasNotChanged;

        var cb = new obsjs.callbacks.propertyCallback(callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged);
        if (!this.$callbacks[property]) this.$callbacks[property] = [];
        this.$callbacks[property].push(cb);

        this.onNextPropertyChange(property, function (change) {
            cb.activatingChange = change;
        });
        
        var dispose = {
            dispose: ((function (allowPendingChanges) {

                if (!dispose) return;
                dispose = null;
                
                if (allowPendingChanges)
                    this.onNextPropertyChange(property, function (change) {
                        cb.deactivatingChange = change;
                    });
                else
                    cb.deactivated = true;
            }).bind(this))
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
    
    observableBase.prototype.del = function (property) {
        
        delete (this.$forObject || this)[property];
    };
    
    observableBase.newObservable = function () {
        return observableBase.makeObservable({});
    };

    observableBase.makeObservable = function (object) {
        if (observableBase.canObserve(object)) return object;
        
        if (object.$observer) throw "The $observer property is reserved";

        Object.defineProperty(object, "$observer", {
            enumerable: false,
            configurable: false,
            value: new obsjs.observable(object),
            writable: false
        });
        
        return object;
    };

    observableBase.observe = function (object, property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged) {
        observableBase.makeObservable(object);
        return observableBase.tryObserve(object, property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged);
    };

    observableBase.tryObserve = function (object, property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged) {
        
        var target = object instanceof observableBase ?
            object :
            (object.$observer instanceof observableBase ? object.$observer : null);
        
        if (target)
            return target.observe(property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged);
        
        return false;
    };

    observableBase.canObserve = function (object) {
        
        return object instanceof observableBase || (object && object.$observer instanceof observableBase);
    };

    observableBase.del = function (object, property) {
        
        var target = object instanceof observableBase ?
            object :
            (object.$observer instanceof observableBase ? object.$observer : null);
        
        if (target)
            return target.del(property);
    };

    observableBase.dispose = function (object, property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged) {
        if (object instanceof observableBase)
            return object.dispose();

        if (object.$observer instanceof observableBase)
            return object.$observer.dispose();
    };
    
    return observableBase;
});