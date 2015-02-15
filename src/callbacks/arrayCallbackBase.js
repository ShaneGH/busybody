
Class("obsjs.callbacks.arrayCallbackBase", function () {
        
    var arrayCallbackBase = obsjs.callbacks.changeCallback.extend(function arrayCallbackBase(evaluateOnEachChange) {
        
        this._super(evaluateOnEachChange);
    });

    arrayCallbackBase.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
                
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
            changes.compiled.push(result = new obsjs.utils.compiledArrayChange(changes, beginAt, endAt));
        
        this._evaluateArrayMultiple(result);
    };
    
    arrayCallbackBase.prototype._evaluateArrayMultiple = function (compiledArrayChange) {
        throw "Abstract methods must be implemented";
    };
    
    return arrayCallbackBase;
});