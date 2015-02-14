
Class("obsjs.callbacks.boundArrayCallback", function () {
        
    var boundArrayCallback = obsjs.callbacks.arrayCallbackBase.extend(function boundArrayCallback(fromArray, toArray) {
        
        this._super(false);
        
        this.fromArray = fromArray;
        this.toArray = toArray;
    });

    boundArrayCallback.prototype._evaluateSingle = function (changes, index) {

        // cannot evaluate single
        return this._evaluateMultiple(changes, index, index + 1);
    };

    boundArrayCallback.prototype._evaluateArrayMultiple = function (result) {
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
    
    var getId = (function () {
        var i = 0;
        return function () {
            return "id-" + (++i);
        };
    }());
    
    bindArrays.prototype.executeAndCapture = function (compiledChanges, addChangesTo) {
        obsjs.observable.captureArrayChanges(this.toArray, (function () { this.execute(compiledChanges); }).bind(this), function (changes) {
            var id = getId();
            addChangesTo[id] = changes;
            
            // cleanup: will only be needed for a couple of observe cycles
            setTimeout(function () {
                delete addChangesTo[id];
            }, 100);
        });
    }
    
    bindArrays.prototype.execute = function (compiledChanges) {
        
        var forbidden = [], vals;
        if (this.toArray instanceof obsjs.array && (vals = this.fromArray.$boundArrays.value(this.toArray)))
            enumerateObj(vals, function (val) {
                forbidden.push.apply(forbidden, val);
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