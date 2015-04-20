
Class("busybody.callbacks.arrayCallback", function () {
        
    var arrayCallback = busybody.callbacks.changeCallback.extend(function arrayCallback(callback, context, options) {
        
        this._super(options && options.evaluateOnEachChange);
        
		this.useRawChanges = options && options.useRawChanges;
        this.callback = callback;
        this.context = context;
    });

    arrayCallback.prototype._evaluateSingle = function (changes, index) {

        this.callback.call(this.context, changes[index]);
    };

    arrayCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
		
		if (this.useRawChanges) {
			this.callback.call(this.context, changes.slice(beginAt, endAt));
			return;
		}
                
        if (!changes.compiled)
            changes.compiled = [];
        
        var result;
        for (var i = 0, ii = changes.compiled.length; i < ii; i++) {
            if (changes.compiled[i].areEqual(beginAt, endAt)) {
                result = changes.compiled[i];
                break;
            }
        }
        
        if (!result)
            changes.compiled.push(result = new busybody.utils.compiledArrayChange(changes, beginAt, endAt));
        
        this._evaluateArrayMultiple(result);
    };

    arrayCallback.prototype._evaluateArrayMultiple = function (result) {
        
        this.callback.call(this.context, result.getRemoved(), result.getAdded(), result.getIndexes());
    };
    
    return arrayCallback;
});