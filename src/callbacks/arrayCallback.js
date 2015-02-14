
Class("obsjs.callbacks.arrayCallback", function () {
        
    var arrayCallback = obsjs.callbacks.arrayCallbackBase.extend(function arrayCallback(callback, context, evaluateOnEachChange) {
        
        this._super(evaluateOnEachChange);
        
        this.callback = callback;
        this.context = context;
    });

    arrayCallback.prototype._evaluateSingle = function (changes, index) {

        //TODO setTimeout?
        this.callback.call(this.context, changes[index]);
    };

    arrayCallback.prototype._evaluateArrayMultiple = function (result) {
        
        this.callback.call(this.context, result.getRemoved(), result.getAdded(), result.getIndexes());
    };
    
    return arrayCallback;
});