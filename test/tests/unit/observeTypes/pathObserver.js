module("obsjs.observeTypes.pathObserver", {
    setup: function() {
    },
    teardown: function() {
    }
});

var pathObserver = obsjs.observeTypes.pathObserver;

testUtils.testWithUtils("_execute", "no cancel", false, function(methods, classes, subject, invoker) {
    // arrange
	subject.val = 11;
    subject.forObject = {
        aa: {bb: {cc: 22}}
    };
    subject.path = ["aa", "bb", "cc"];
    
    // act
    var output = invoker();
    
    // assert
    strictEqual(subject.val, 22);
    strictEqual(output.arguments.length, 2);
    strictEqual(output.arguments[0], 11);
    strictEqual(output.arguments[1], 22);
    ok(!output.cancel);
});

testUtils.testWithUtils("_execute", "no cancel", false, function(methods, classes, subject, invoker) {
    // arrange
	subject.val = 11;
    subject.forObject = {
        aa: {bb: {cc: 11}}
    };
    subject.path = ["aa", "bb", "cc"];
    
    // act
    var output = invoker();
    
    // assert
    ok(output.cancel);
});

testUtils.testWithUtils("onValueChanged", null, false, function(methods, classes, subject, invoker) {
    // arrange
	var val = subject.val = {}, cb = methods.method([undefined, val]), op = {};
	subject.addCallback = methods.method([cb], op);
    
    // act
    var output = invoker(cb, true);
    
    // assert
    strictEqual(op, output);
});

testUtils.testWithUtils("buildObservableChain", null, false, function(methods, classes, subject, invoker) {
	ok(true, "tested in integration");
});

testUtils.testWithUtils("dispose", null, false, function(methods, classes, subject, invoker) {
    // arrange
	subject._super = methods.method();
	subject.__pathDisposables = [{dispose: methods.method()}];
    
    // act
    invoker();
    
    // assert
    strictEqual(subject.__pathDisposables.length, 0);
});