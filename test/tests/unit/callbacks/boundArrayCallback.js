module("obsjs.callbacks.boundArrayCallback", {
    setup: function() {
    },
    teardown: function() {
    }
});

var boundArrayCallback = obsjs.callbacks.boundArrayCallback;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var fa = new obsjs.array, ta = [];
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
    subject = new boundArrayCallback(new obsjs.array(), new obsjs.array([11,"XX", 44]));
    
    // act
    subject._evaluateArrayMultiple({changes: [{
        index: 1,
        added: [22, 33],
        removed: ["XX"]
    }]});
    
    // assert
    strictEqual(subject.toArray[0], 11);
    strictEqual(subject.toArray[1], 22);
    strictEqual(subject.toArray[2], 33);
    strictEqual(subject.toArray[3], 44);
    strictEqual(subject.toArray.length, 4);
});