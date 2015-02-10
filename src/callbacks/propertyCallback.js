
Class("obsjs.callbacks.propertyCallback", function () {
        
    var propertyCallback = obsjs.callbacks.changeCallback.extend(function propertyCallback(callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged) {
        
        this._super(evaluateOnEachChange);
        
        this.callback = callback;
        this.context = context;
        this.evaluateIfValueHasNotChanged = evaluateIfValueHasNotChanged;
    });

    propertyCallback.prototype._evaluateSingle = function (changes, index) {

        //TODO setTimeout?
        var change = changes[index], 
            nextChange = changes[index + 1], 
            newVal = nextChange ? nextChange.oldValue : change.object[change.name];
        
        if (this.evaluateIfValueHasNotChanged || newVal !== change.oldValue)
            this.callback.call(this.context, change.oldValue, newVal);
    };

    propertyCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
                
        //TODO setTimeout?
        var newVal = changes[endAt] ? changes[endAt].oldValue : changes[0].object[changes[0].name];
        if (this.evaluateIfValueHasNotChanged || newVal !== changes[beginAt].oldValue)
            this.callback.call(this.context, changes[beginAt].oldValue, newVal);
    };
    
    return propertyCallback;
});