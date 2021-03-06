module("busybody.callbacks.arrayCallback", {
    setup: function() {
    },
    teardown: function() {
    }
});

var computed = busybody.observeTypes.computed;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var ev = {}, ca = {}, co = {};
    subject._super = methods.method([ev]);
    
    // act
    invoker(ca, {evaluateOnEachChange: ev, context: co});
    
    // assert
    strictEqual(subject.callback, ca);
    strictEqual(subject.context, co);
});

testUtils.testWithUtils("_evaluateSingle", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var ch = [{}, {}], index = 1;
    subject.context = {};
    subject.callback = methods.customMethod(function () {
        strictEqual(this, subject.context);
        strictEqual(arguments[0], ch[index]);
    });
    
    // act
    // assert
    invoker(ch, index);
});

testUtils.testWithUtils("_evaluateArrayMultiple", null, false, function(methods, classes, subject, invoker) {
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