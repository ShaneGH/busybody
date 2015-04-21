
Class("busybody.callbacks.propertyCallback", function () {
        
    var propertyCallback = busybody.callbacks.changeCallback.extend(function propertyCallback(callback, context, options) {
		///<summary>Evaluate property changes<summary>
		///<param name="callback" type="Function">The callback to execute<param>
		///<param name="context" type="Any" optional="true">The "this" in the callback<param>
		///<param name="options" type="Object" optional="true">Options for the callback<param>
		///<param name="options.useRawChanges" type="Boolean">Default: false. Use the change objects from the Array.observe as arguments<param>
		///<param name="options.evaluateOnEachChange" type="Boolean">Default: false. Evaluate once for each change rather than on an amalgamation of changes<param>
		///<param name="options.evaluateIfValueHasNotChanged" type="Boolean">Default: false. Evaluate if the oldValue and the newValue are the same<param>
		
        this._super(options && options.evaluateOnEachChange);
        
		///<summary type="Function">The callback to execute<summary>
        this.callback = callback;
		
		///<summary type="Any" optional="true">The "this" in the callback<summary>
        this.context = context;
        this.evaluateIfValueHasNotChanged = options && options.evaluateIfValueHasNotChanged;
		
		///<summary type="Boolean">Default: false. Evaluate if the oldValue and the newValue are the same<summary>
		this.useRawChanges = options && options.useRawChanges;
    });

    propertyCallback.prototype._evaluateSingle = function (changes, index) {
		///<summary>Evaluate a single change<summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch<param>
		///<param name="index" type="Number">The index of the change to execute<param>
		///<returns type="Any">The return value of the callback<param>

        var change = changes[index], 
            nextChange = changes[index + 1], 
            newVal = nextChange ? nextChange.oldValue : change.object[change.name];
        
		if (this.useRawChanges)
            this.callback.call(this.context, change);
        else if (this.evaluateIfValueHasNotChanged || newVal !== change.oldValue)
            this.callback.call(this.context, change.oldValue, newVal);
    };

    propertyCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
		///<summary>Evaluate on batch of changes<summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch<param>
		///<param name="beginAt" type="Number">The index of the first change to execute<param>
		///<param name="endAt" type="Number">The index of the change after the last change to execute<param>
		///<returns type="Any">The return value of the callback<param>
		
		var newVal = changes[endAt] ? changes[endAt].oldValue : changes[0].object[changes[0].name];
        
		if (this.useRawChanges)
            this.callback.call(this.context, changes.slice(beginAt, endAt));
        else if (this.evaluateIfValueHasNotChanged || newVal !== changes[beginAt].oldValue)
            this.callback.call(this.context, changes[beginAt].oldValue, newVal);
    };
    
    return propertyCallback;
});