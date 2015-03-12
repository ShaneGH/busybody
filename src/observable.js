    
var observable = useObjectObserve ?
    Class("obsjs.observable", function () {
        var observable = obsjs.observableBase.extend(function observable(forObject) {
            this._super(forObject);
        });

        observable.prototype.onNextPropertyChange = function (property, callback) {

            var cb = (function (changes) {
                if (!cb) return;
                for (var i = 0, ii = changes.length; i < ii; i++) {
                    if (changes[i].name === property) {                            
                        var _cb = cb;
                        Object.unobserve(this.$forObject || this, _cb);
                        cb = null;
                        callback(changes[i]);
                        return;
                    }
                }
            }).bind(this);

            Object.observe(this.$forObject || this, cb);
        };

        observable.prototype.captureChanges = function (logic, callback) {

            // make unique callback
            var cb = function () { callback.apply(this, arguments) };
            Object.observe(this.$forObject || this, cb);
            logic();
            Object.unobserve(this.$forObject || this, cb);
        };

        observable.prototype._init = function () {
            if (this.__subscribeCallback) return;

            this.__subscribeCallback = this.registerChangeBatch.bind(this);
            Object.observe(this.$forObject || this, this.__subscribeCallback);
        };

        observable.prototype.dispose = function () {
            this._super();

            if (this.__subscribeCallback) {
                Object.unobserve(this.$forObject || this, this.__subscribeCallback);
                delete this.__subscribeCallback;
            }
        };

        return observable;
    }) :
    Class("obsjs.observable", function () {
        var observable = obsjs.observableBase.extend(function observable(forObject) {
            this._super(forObject);

            this.$observed = {};
            this.$onNextPropertyChanges = {};
            this.$captureCallbacks = [];
        });

        observable.prototype.onNextPropertyChange = function (property, callback) {

            (this.$onNextPropertyChanges[property] || (this.$onNextPropertyChanges[property] = [])).push(callback);
        };

        observable.prototype.captureChanges = function (logic, callback) {

            // make unique callback
            var cb = function () { callback.apply(this, arguments) };
            this.$captureCallbacks.push(cb);
            logic();
            this.$captureCallbacks.splice(this.$captureCallbacks.indexOf(cb), 1);
        };

        function getObserver(forObject) { return forObject.$observer || forObject; }
        observable.prototype._init = function (forProperty) {

            if (this.$observed.hasOwnProperty(forProperty)) return;

            if ((this.$forObject || this).hasOwnProperty(forProperty))
                this.$observed[forProperty] = (this.$forObject || this)[forProperty];

            Object.defineProperty(this.$forObject || this, forProperty, {
                get: function() {
                    return getObserver(this).$observed[forProperty];
                },
                set: function (value) {

                    var obs = getObserver(this);
                    var change = {
                        type: obs.$observed.hasOwnProperty(forProperty) ? "update" : "add",
                        name: forProperty,
                        object: this,
                        oldValue: obs.$observed[forProperty]
                    };
                    obs.$observed[forProperty] = value;
                    if (obs.$onNextPropertyChanges[forProperty]) {
                        var callbacks = obs.$onNextPropertyChanges[forProperty];
                        delete obs.$onNextPropertyChanges[forProperty];
                        setTimeout(function () {
                            enumerateArr(callbacks, function (a) {
                                a(change);
                            });
                        });
                    }

                    obs.addChange(change);

                },
                enumerable: true,
                configurable: true
            });
        };
        
        observable.prototype.addChange = function (change) {
            
            if (!this.__changeToken) {
                this.__changeToken = [];
                setTimeout((function () {
                    var ct = this.__changeToken;
                    delete this.__changeToken;                    
                    this.registerChangeBatch(ct);
                }).bind(this));
            }
            
            this.__changeToken.push(change);
            enumerateArr(this.$captureCallbacks, function (cb) {
                cb([change]);
            });          
        };
    
        observable.prototype.del = function (property) {

            (this.$forObject || this)[property] = undefined;
            this._super(property);
        }

        observable.prototype.dispose = function () {
            this._super();
            for (var i in this.$onNextPropertyChanges)
                delete this.$onNextPropertyChanges[i];
        };

        return observable;
    });