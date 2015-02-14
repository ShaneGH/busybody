module("obsjs.callbacks.boundArrayCallback", {
    setup: function() {
    },
    teardown: function() {
    }
});

var computed = obsjs.observeTypes.computed;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var fa = [], ta = [];
    subject._super = methods.method([false]);
    
    // act
    invoker(fa, ta);
    
    // assert
    strictEqual(subject.fromArray, fa);
    strictEqual(subject.toArray, ta);
});

testUtils.testWithUtils("_evaluateSingle", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var ch = [], index = 1;
    subject._evaluateMultiple = methods.method([ch, index, index + 1]);
    
    // act
    // assert
    invoker(ch, index);
});

testUtils.testWithUtils("_evaluateArrayMultiple/bindArrays", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var rem = {}, ad= {}, ind = {}, result = {
        getRemoved: methods.method([], rem),
        getAdded: methods.method([], ad),
        getIndexes: methods.method([], ind)
    };
    subject.context = {};
    subject.callback = methods.customMethod(function () {
        strictEqual(this, subject.context);
        strictEqual(arguments[0], rem);
        strictEqual(arguments[1], ad);
        strictEqual(arguments[2], ind);
    });
    
    // act
    // assert
    invoker(result);
});

function aa() {
        
    var boundArrayCallback = obsjs.callbacks.arrayCallbackBase.extend(function boundArrayCallback(fromArray, toArray) {
        
        this._super(false);
        
        if (!(fromArray instanceof obsjs.array))
            throw "The from array must be an \"obsjs.array\"";
        
        if (!(toArray instanceof Array))
            throw "The to array must be an \"Array\"";
            
        this.fromArray = fromArray;
        this.toArray = toArray;
    });

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
        obsjs.observable.captureArrayChanges(
            this.toArray, 
            (function () { this.execute(compiledChanges); }).bind(this), 
            function (changes) {
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
}