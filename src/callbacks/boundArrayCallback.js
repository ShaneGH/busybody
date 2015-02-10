
Class("obsjs.callbacks.boundArrayCallback", function () {
        
    var boundArrayCallback = obsjs.callbacks.changeCallback.extend(function arrayCallback(fromArray, toArray) {
        
        this._super(false);
        
        this.fromArray = fromArray;
        this.toArray = toArray;
    });

    boundArrayCallback.prototype._evaluateSingle = function (changes, index) {

        return this._evaluateMultiple(changes, index, index + 1);
    };

    boundArrayCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
                
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
        
        var execute = (function () {
            var forbidden = [], fb;
            if (this.toArray instanceof obsjs.array && (fb = this.toArray.$boundArrays.value(this.fromArray)))
                enumerateArr(fb, function (fb) {
                    forbidden.push.apply(forbidden, fb);
                });
                
            enumerateArr(result.changes, function (change) {
                if (forbidden.indexOf(change) !== -1) return;
                
                var args = change.added.slice();
                args.splce(0, 0, change.index, change.removed.length);
                this.toArray.splice.apply(this.toArray, args);
            }, this);
        }).bind(this);
        
        var vals;
        if (this.toArray instanceof obsjs.array && (vals = this.toArray.$boundArrays.value(this.fromArray))) {
            obsjs.observable.captureArrayChanges(this.toArray, execute, (function (changes) {
                vals.push(changes);
                setTimeout(function () {
                    vals.remove(changes);
                }, 100);
            }).bind(this));
        } else {
            execute();
        }
    };
    
    return boundArrayCallback;
});