
Class("busybody.callbacks.arrayCallback", function () {
        
    var arrayCallback = busybody.callbacks.changeCallback.extend(function arrayCallback(callback, context, options) {
		///<summary>Evaluate array changes</summary>
		///<param name="callback" type="Function">The callback to execute</param>
		///<param name="context" type="Any" optional="true">The "this" in the callback</param>
		///<param name="options" type="Object" optional="true">Options for the callback</param>
		///<param name="options.useRawChanges" type="Boolean">Default: false. Use the change objects from the Array.observe as arguments</param>
		///<param name="options.evaluateOnEachChange" type="Boolean">Default: false. Evaluate once for each change rather than on an amalgamation of changes</param>
		
        this._super(options && options.evaluateOnEachChange);
        
		///<summary type="Boolean">Use the change objects from the Array.observe as arguments</summary>
		this.useRawChanges = options && options.useRawChanges;
		
		///<summary type="Function">The callback to execute</summary>
        this.callback = callback;
		
		///<summary type="Any" optional="true">The "this" in the callback</summary>
        this.context = context;
    });

    arrayCallback.prototype._evaluateSingle = function (changes, index) {
		///<summary>Evaluate a single change</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<param name="index" type="Number">The index of the change to execute</param>
		///<returns type="Any">The return value of the callback</param>

        this.callback.call(this.context, changes[index]);
    };

    arrayCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
		///<summary>Evaluate on batch of changes</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<param name="beginAt" type="Number">The index of the first change to execute</param>
		///<param name="endAt" type="Number">The index of the change after the last change to execute</param>
		///<returns type="Any">The return value of the callback</param>
		
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
		///<summary>Evalue the callback</summary>
		///<param name="result" type="busybody.utils.compiledArrayChange">Inputs for the callback</param>
		///<returns type="Any">The return value of the callback</param>
        
        this.callback.call(this.context, result.getRemoved(), result.getAdded(), result.getIndexes());
    };
    
    return arrayCallback;
});