
Class("obsjs.callbacks.boundArrayCallback", function () {
        
    var boundArrayCallback = obsjs.callbacks.changeCallback.extend(function boundArrayCallback(fromArray, toArray) {
        
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
        
        var vals, executor = new bindArrays(this.fromArray, this.toArray);  
        if (this.toArray instanceof obsjs.array && (vals = this.toArray.$boundArrays.value(this.fromArray))) {
            executor.executeAndCapture(result.changes, vals);
        } else {
            executor.execute(result.changes);
        }
    };
    
    function bindArrays (fromArray, toArray) {
        
        this.fromArray = fromArray;
        this.toArray = toArray;
    }
    
    bindArrays.prototype.executeAndCapture = function (compiledChanges, addChangesTo) {
        obsjs.observable.captureArrayChanges(this.toArray, (function () { this.execute(compiledChanges); }).bind(this), function (changes) {
            addChangesTo.push(changes);
            setTimeout(function () {
                addChangesTo.splice(addChangesTo.indexOf(changes));
            }, 100);
        });
    }
    
    bindArrays.prototype.execute = function (compiledChanges) {
        var forbidden = [], fb;
        if (this.toArray instanceof obsjs.array && (fb = this.fromArray.$boundArrays.value(this.toArray)))
            enumerateArr(fb, function (fb) {
                forbidden.push.apply(forbidden, fb);
            });

        enumerateArr(compiledChanges, function (change) {
            if (forbidden.indexOf(change.change) !== -1) return;

            var args = change.added.slice();
            args.splice(0, 0, change.index, change.removed.length);
            this.toArray.splice.apply(this.toArray, args);
        }, this);
    }
    
    return boundArrayCallback;
});