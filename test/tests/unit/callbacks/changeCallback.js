module("obsjs.callbacks.changeCallback", {
    setup: function() {
    },
    teardown: function() {
    }
});

var changeCallback = obsjs.callbacks.changeCallback;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var ev = {};
    subject._super = methods.method();
    
    // act
    invoker(ev);
    
    // assert
    strictEqual(ev, subject.evaluateOnEachChange);
});

testUtils.testWithUtils("activate", null, false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = {};

    // act
    invoker(ch);
    
    // assert
    strictEqual(ch, subject._activatingChange);
});

testUtils.testWithUtils("activate", "is activated or has activating change", false, function(methods, classes, subject, invoker) {
    
    throws(function () {
        // arrange
        subject._activated = true;

        // act
        // assert
        invoker({});
    });
    
    delete subject._activated;
    throws(function () {
        // arrange
        subject._activatingChange = true;

        // act
        // assert
        invoker({});
    });
});

testUtils.testWithUtils("deactivate", "with args", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = {};
    subject._activated = true;
    
    // act
    invoker(ch);
    
    // assert
    strictEqual(ch, subject._deactivatingChange);
    ok(subject._activated);
});

testUtils.testWithUtils("deactivate", "with args", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = {};
    subject._activated = true;
    
    // act
    invoker();
    
    // assert
    ok(!subject._activated);
});

testUtils.testWithUtils("deactivate", "already deactivated", false, function(methods, classes, subject, invoker) {
    
    // arrange
    subject._deactivatingChange = true;
    
    // act
    // assert
    throws(function () {
        invoker();
    });
});

testUtils.testWithUtils("evaluateSingle", "ok", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [], index = 2;
    subject.evaluateOnEachChange = true;
    subject._activated = true;
    subject._evaluateSingle = methods.method([ch, index]);
    
    // act
    // assert
    invoker(ch, index);
});

testUtils.testWithUtils("evaluateSingle", "deactivate", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [0, 1, 345], index = 2;
    subject.evaluateOnEachChange = true;
    subject._deactivatingChange = 345;
    
    // act
    var output = invoker(ch, index);
    
    // assert
    strictEqual(output, changeCallback.dispose);
});

testUtils.testWithUtils("evaluateSingle", "already deactivated", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [], index = 2;
    subject.evaluateOnEachChange = true;
    subject._deactivatingChange = 345;
    subject._activated = false
    
    // act
    var output = invoker(ch, index);
    
    // assert
    strictEqual(output, changeCallback.dispose);
});

testUtils.testWithUtils("evaluateSingle", "un activated", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [], index = 2;
    subject.evaluateOnEachChange = true;
    
    // act
    // assert
    invoker(ch, index);
    ok(true);   // nothing happens in this test
});

testUtils.testWithUtils("evaluateSingle", "activate", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [0, 1, 345], index = 2;
    subject.evaluateOnEachChange = true;
    subject._activatingChange = 345;
    subject._evaluateSingle = methods.method([ch, index]);
    
    // act
    // assert
    invoker(ch, index);
});

function aa() {
        
    var changeCallback = objjs.object.extend(function changeCallback(evaluateOnEachChange) {
        this._super();
        
        this.evaluateOnEachChange = evaluateOnEachChange;
    });
    
    // remove this callback flag
    changeCallback.dispose = {};
    
    changeCallback.prototype.evaluateMultiple = function (changes) {
        if (this.evaluateOnEachChange || !changes.length) return;

        if (this._activated === false) return changeCallback.dispose;
        
        var beginAt = 0, endAt = changes.length, output = undefined;
        if (!this.hasOwnProperty("_activated")) {
            beginAt = changes.indexOf(this._activatingChange);
            if (beginAt !== -1) {            
                this._activated = true;
                delete this._activatingChange;
            }
            
            // if == -1 case later on
        }

        if (this._deactivatingChange) {
            endAt = changes.indexOf(this._deactivatingChange);
            if (endAt === -1) {
                endAt = changes.length;                
            } else {
                output = changeCallback.dispose;
                this._activated = false;
                delete this._deactivatingChange;
            }
        }
                
        if (beginAt !== -1 && beginAt < endAt) {
            this._evaluateMultiple(changes, beginAt, endAt);
        }
        
        return output;
    };
    
    changeCallback.prototype._evaluateMultiple = function (changes) {
        throw "Abstract methods must be implemented";
    };
    
    return changeCallback;
}