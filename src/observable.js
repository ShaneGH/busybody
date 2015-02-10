    
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
        var observable = observableBase.extend(function observable(forObject) {
            this._super(forObject);

            this.$observed = {};
            this.$onNextPropertyChanges = {};
        });

        observable.prototype.onNextPropertyChange = function (property, callback) {

            (this.$onNextPropertyChanges[property] || (this.$onNextPropertyChanges[property] = [])).push(callback);
        };

        observable.prototype.initializeChangeCycle = function () {
            if (this.__changeToken) return;

            this.__changeToken = [];
            setTimeout((function () {
                var ct = this.__changeToken;
                delete this.__changeToken;
                this.registerChangeBatch(ct);
            }).bind(this));
        }

        observable.prototype._init = function (forProperty) {
            //TODO: all of this

            if (this.$observed.hasOwnProperty(forProperty)) return;

            this.$observed[forProperty] = (this.$forObject || this)[forProperty];

            Object.defineProperty(this.$forObject || this, forProperty, {
                get: function() {
                    return this.$observed[forProperty];
                },
                set: function (value) {

                    var change = {
                        name: forProperty,
                        object: this,
                        oldValue: this.$observed[forProperty],
                        type: "update"  //TODO, add?
                    };
                    this.$observed[forProperty] = value;
                    if (this.$onNextPropertyChanges[forProperty]) {
                        var callbacks = this.$onNextPropertyChanges[forProperty];
                        delete this.$onNextPropertyChanges[forProperty];
                        setTimeout(function () {
                            enumerateArr(callbacks, function (a) {
                                a(change);
                            });
                        });
                    }

                    this.initializeChangeCycle();

                    this.__changeToken.push(change);
                },
                enumerable: true,
                configurable: true //TODO: !this.usePrototypeAndWoBag
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