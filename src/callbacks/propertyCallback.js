
Class("obsjs.callbacks.propertyCallback", function () {
        
    var propertyCallback = obsjs.callbacks.changeCallback.extend(function propertyCallback(callback, context, options) {
        
		// options: evaluateOnEachChange, evaluateIfValueHasNotChanged, useRawChanges
		
        this._super(options && options.evaluateOnEachChange);
        
        this.callback = callback;
        this.context = context;
        this.evaluateIfValueHasNotChanged = options && options.evaluateIfValueHasNotChanged;
		this.useRawChanges = options && options.useRawChanges;
    });

    propertyCallback.prototype._evaluateSingle = function (changes, index) {

        var change = changes[index], 
            nextChange = changes[index + 1], 
            newVal = nextChange ? nextChange.oldValue : change.object[change.name];
        
		if (this.useRawChanges)
            this.callback.call(this.context, change);
        else if (this.evaluateIfValueHasNotChanged || newVal !== change.oldValue)
            this.callback.call(this.context, change.oldValue, newVal);
    };

    propertyCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
		
		var newVal = changes[endAt] ? changes[endAt].oldValue : changes[0].object[changes[0].name];
        
		if (this.useRawChanges)
            this.callback.call(this.context, changes.slice(beginAt, endAt));
        else if (this.evaluateIfValueHasNotChanged || newVal !== changes[beginAt].oldValue)
            this.callback.call(this.context, changes[beginAt].oldValue, newVal);
    };
    
    return propertyCallback;
});