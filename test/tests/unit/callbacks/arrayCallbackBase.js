module("obsjs.callbacks.arrayCallbackBase", {
    setup: function() {
    },
    teardown: function() {
    }
});

var computed = obsjs.observeTypes.computed;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var ev = {};
    subject._super = methods.method([ev]);
    
    // act
    // assert
    invoker(ev);
});

testUtils.testWithUtils("_evaluateMultiple", "has result", false, function(methods, classes, subject, invoker) {
    // arrange
    var ch = [], ba = {}, ea= {};
    ch.compiled = [{
        areEqual: methods.method([ba, ea], true)
    }];
    subject._evaluateArrayMultiple = methods.method([ch.compiled[0]]);
    
    // act
    // assert
    invoker(ch, ba, ea);
});

testUtils.testWithUtils("_evaluateMultiple", "no result", false, function(methods, classes, subject, invoker) {
    // arrange
    var ch = [], ba = {}, ea = {}, res;
    subject._evaluateArrayMultiple = methods.dynamicMethod(function () { ok(res); return [res]; });
    classes.mock("obsjs.utils.compiledArrayChange", function () {
        methods.method(arguments)(ch, ba, ea);
        res = this;
    }, 1);    
    
    // act
    invoker(ch, ba, ea);
    
    // assert
    ok(res);
    strictEqual(ch.compiled[0], res);
});