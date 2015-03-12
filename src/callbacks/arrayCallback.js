
Class("obsjs.callbacks.arrayCallback", function () {
        
    var arrayCallback = obsjs.callbacks.arrayCallbackBase.extend(function arrayCallback(callback, context, options) {
        
        this._super(options && options.evaluateOnEachChange);
        
		this.useRawChanges = options && options.useRawChanges;
        this.callback = callback;
        this.context = context;
    });

    arrayCallback.prototype._evaluateSingle = function (changes, index) {

        this.callback.call(this.context, changes[index]);
    };

    arrayCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
		
		if (this.useRawChanges)
			this.callback.call(this.context, changes.slice(beginAt, endAt));
		else
			this._super.apply(this, arguments);
    };

    arrayCallback.prototype._evaluateArrayMultiple = function (result) {
        
        this.callback.call(this.context, result.getRemoved(), result.getAdded(), result.getIndexes());
    };
    
    return arrayCallback;
});