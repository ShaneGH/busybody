
Class("obsjs.callbacks.arrayCallback", function () {
        
    var arrayCallback = obsjs.callbacks.changeCallback.extend(function arrayCallback(callback, context, evaluateOnEachChange) {
        
        this._super(evaluateOnEachChange);
        
        this.callback = callback;
        this.context = context;
    });

    arrayCallback.prototype._evaluateSingle = function (changes, index) {

        //TODO setTimeout?
        this.callback.call(this.context, changes[index]);
    };

    arrayCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
                
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
            changes.push(result = new obsjs.utils.compiledArrayChange(changes, beginAt, endAt));
        
        this.callback.call(this.context, result.getRemoved(), result.getAdded(), result.getIndexes());
    };
    
    return arrayCallback;
});