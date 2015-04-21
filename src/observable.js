    
var observable = useObjectObserve ?
    Class("busybody.observable", function () {
        var observable = busybody.observableBase.extend(function observable(forObject) {
			///<summary>An object whose properties can be subscribed to</summary>
			///<param name="forObject" type="Object" optional="true">Observe changes to another object</param>
			
            this._super(forObject);
        });

        observable.prototype.onNextPropertyChange = function (property, callback) {
			///<summary>Fire a callback once, the next property change</summary>
			///<param name="property" type="String">The property to observe</param>
			///<param name="callback" type="Function">The callback</param>

            var cb = (function (changes) {
                if (!cb) return;
                for (var i = 0, ii = changes.length; i < ii; i++) {
                    if (changes[i].name == property) {	// in this case numbers and strings are the same
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

        observable.prototype._captureChanges = function (logic, callback) {
			///<summary>Capture all of the changes to the property perpetrated by the logic</summary>
			///<param name="logic" type="Function">The function which will change the array</param>
			///<param name="callback" type="Function">The callback (function (changes) { })</param>
			///<param name="toProperty" type="String">The property</param>
			
			Object.observe(this.$forObject || this, callback);
			logic();
			Object.unobserve(this.$forObject || this, callback);
        };

        observable.prototype._init = function () {
			///<summary>Begin observing a property</summary>
			///<param name="forProperty" type="String">The property</param>
			
            if (this.__subscribeCallback) return;

            this.__subscribeCallback = this.registerChangeBatch.bind(this);
            Object.observe(this.$forObject || this, this.__subscribeCallback);
        };

        observable.prototype.dispose = function () {
			///<summary>Dispose</summary>
			
            this._super();

            if (this.__subscribeCallback) {
                Object.unobserve(this.$forObject || this, this.__subscribeCallback);
                delete this.__subscribeCallback;
            }
        };

        return observable;
    }) :
    Class("busybody.observable", function () {
        var observable = busybody.observableBase.extend(function observable(forObject) {
			///<summary>An object whose properties can be subscribed to</summary>
			///<param name="forObject" type="Object" optional="true">Observe changes to another object</param>
			
            this._super(forObject);

            this.$observed = {};
            this.$onNextPropertyChanges = {};
            this.$captureCallbacks = [];
        });

        observable.prototype.onNextPropertyChange = function (property, callback) {
			///<summary>Fire a callback once, the next property change</summary>
			///<param name="property" type="String">The property to observe</param>
			///<param name="callback" type="Function">The callback</param>

            (this.$onNextPropertyChanges[property] || (this.$onNextPropertyChanges[property] = [])).push(callback);
        };

        observable.prototype._captureChanges = function (logic, callback) {
			///<summary>Capture all of the changes to the property perpetrated by the logic</summary>
			///<param name="logic" type="Function">The function which will change the array</param>
			///<param name="callback" type="Function">The callback (function (changes) { })</param>
			///<param name="toProperty" type="String">The property</param>

            this.$captureCallbacks.push(callback);
            logic();
            this.$captureCallbacks.splice(this.$captureCallbacks.indexOf(callback), 1);
        };

		//TODO: prototype
        function getObserver(forObject) { return forObject.$observer || forObject; }
        observable.prototype._init = function (forProperty) {
			///<summary>Begin observing a property</summary>
			///<param name="forProperty" type="String">The property</param>

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
			///<summary>Add a change to the batch</summary>
			///<param name="change" type="Object">The change</param>
            
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
			///<summary>Delete a property and publish changes.</summary>
			///<param name="property" type="String">The property</param>

            (this.$forObject || this)[property] = undefined;
            this._super(property);
        }

        observable.prototype.dispose = function () {
			///<summary>Dispose.</summary>
			
            this._super();
            for (var i in this.$onNextPropertyChanges)
                delete this.$onNextPropertyChanges[i];
        };

        return observable;
    });