useObjectObserve ?
Class("busybody.array", function () {
    
    var array = busybody.arrayBase.extend(function array (initialValues) {
		///<summary>An observable array</summary>
		///<param name="initialValues" type="[Any]">Initial values for the array</param>
		
		if (!(this instanceof array))
			return new array(initialValues);
		
        this._super.apply(this, arguments);
    });
         
    array.prototype.onNextArrayChange = function (callback) {
		///<summary>Fire a callback once, the next array change</summary>
		///<param name="callback" type="Function">The callback</param>

        var cb = (function (changes) {
            if (!cb) return;
            for (var i = 0, ii = changes.length; i < ii; i++) {
                if (busybody.arrayBase.isValidArrayChange(changes[i])) {    
                    Array.unobserve(this, cb);
                    cb = null;
                    callback(changes[i]);
                    return;
                }
            }
        }).bind(this);

        Array.observe(this, cb);
    };
    
    array.prototype.captureArrayChanges = function (logic, callback) {
		///<summary>Capture all of the changes to the array perpetrated by the logic</summary>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
        
        var cb = function (changes) {
            changes = changes.slice();
            for (var i = changes.length - 1; i >= 0; i--)
                if (!busybody.arrayBase.isValidArrayChange(changes[i]))
                    changes.splice(i, 1);

            callback(changes);
        };
        
        Array.observe(this, cb);
        logic();
        Array.unobserve(this, cb);
    };

    array.prototype._init = function () {
		///<summary>Begin observing</summary>
		
        if (this.__subscription) return;
        
        this.__subscription = this.registerChangeBatch.bind(this);
        Array.observe(this, this.__subscription);
    };
    
    array.prototype.dispose = function () {
		///<summary>Dispose of this</summary>
		
        this._super();        
        
        if (this.__subscription) {
            Array.unobserve(this, this.__subscription);
            delete this.__subscription;
        }
    };
		///<summary>Capture all of the changes to the array perpetrated by the logic</summary>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
    
    return array;
}) :
Class("busybody.array", function () {
    
    var array = busybody.arrayBase.extend(function array (initialValues) {
		///<summary>An observable array</summary>
		///<param name="initialValues" type="[Any]">Initial values for the array</param>
		
		if (!(this instanceof array))
			return new array(initialValues);
        
        this._super.apply(this, arguments);
        
		///<summary type="[Function]">Callbacks to fire the next time the array changes</summary>
        this.$onNextArrayChanges = [];
		
		///<summary type="[Function]">Callbacks which capture changes to the array</summary>
        this.$captureCallbacks = [];
    }); 
    
    array.prototype.captureArrayChanges = function (logic, callback) {
		///<summary>Capture all of the changes to the array perpetrated by the logic</summary>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
        
        var cb = function (changes) {
            changes = changes.slice();
            for (var i = changes.length - 1; i >= 0; i--)
                if (!busybody.arrayBase.isValidArrayChange(changes[i]))
                    changes.splice(i, 1);

            callback(changes);
        };
        
        this.$captureCallbacks.push(cb);
        logic();
        this.$captureCallbacks.splice(this.$captureCallbacks.indexOf(cb), 1);
    };
    
    array.prototype.registerChangeBatch = function (changes) {
		///<summary>Register a batch of changes to this array</summary>
		///<param name="changes" type="[Object]">The changes</param>
		
        for (var i = 0, ii = changes.length; i < ii; i++) {
            if (busybody.arrayBase.isValidArrayChange(changes[i])) {
                enumerateArr(this.$onNextArrayChanges.splice(0, this.$onNextArrayChanges.length), function (cb) {
                    cb(changes[i]);
                });
                
                break;
            }
        }
        
        enumerateArr(this.$captureCallbacks, function (cb) {
            cb(changes);
        });
        
        return this._super(changes);
    };
         
    array.prototype.onNextArrayChange = function (callback) {
		///<summary>Fire a callback once, the next array change</summary>
		///<param name="callback" type="Function">The callback</param>

        this.$onNextArrayChanges.push(callback);
    };

    array.prototype._init = function () {
		///<summary>Begin observing</summary>
		
        // unneeded
    };
    
    return array;
});