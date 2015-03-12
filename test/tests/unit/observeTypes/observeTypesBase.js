module("obsjs.observeTypes.observeTypesBase", {
    setup: function() {
    },
    teardown: function() {
    }
});

var pathObserver = obsjs.observeTypes.pathObserver;

testUtils.testWithUtils("_execute", "no cancel", false, function(methods, classes, subject, invoker) {
    // arrange
	subject.val = 11;
	subject.getValue = methods.method([], 22);
    
    // act
    var output = invoker();
    
    // assert
    strictEqual(subject.val, 22);
    strictEqual(output.arguments.length, 2);
    strictEqual(output.arguments[0], 11);
    strictEqual(output.arguments[1], 22);
    ok(!output.cancel);
});

testUtils.testWithUtils("_execute", "cancel", false, function(methods, classes, subject, invoker) {
    // arrange
	subject.val = 11;
	subject.getValue = methods.method([], 11);
    
    // act
    var output = invoker();
    
    // assert
    strictEqual(subject.val, 11);
    strictEqual(output.arguments.length, 2);
    strictEqual(output.arguments[0], 11);
    strictEqual(output.arguments[1], 11);
    ok(output.cancel);
});