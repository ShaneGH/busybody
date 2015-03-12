module("obsjs.observeTypes.pathObserver", {
    setup: function() {
    },
    teardown: function() {
    }
});

var pathObserver = obsjs.observeTypes.pathObserver;

testUtils.testWithUtils("getValue", "valid path", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.forObject = {
        aa: {bb: {cc: 22}}
    };
    subject.path = ["aa", "bb", "cc"];
    
    // act
    var output = invoker();
    
    // assert
    strictEqual(output, 22);
});

testUtils.testWithUtils("getValue", "invalid path", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.forObject = {
        aa: 22
    };
    subject.path = ["aa", "bb", "cc"];
    
    // act
    var output = invoker();
    
    // assert
    strictEqual(output, null);
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