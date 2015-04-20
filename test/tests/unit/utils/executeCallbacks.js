module("bb.utils.executeCallbacks", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("addCallback", null, false, function(methods, classes, subject, invoker) {
	// arrange
	var op = {}, input = {};
	subject.callbacks = [];
	subject.registerDisposable = methods.method([op]);
	classes.mock("bb.utils.obj.addWithDispose", function (a, b) {
		methods.method([a, b])(subject.callbacks, input);
		return op;
	}, 1);
	
	// act
	var output = invoker(input);
	
	// assert
	strictEqual(op, output);
});

testUtils.testWithUtils("execute", "no cancel", false, function(methods, classes, subject, invoker) {
	// arrange
	var args = [{}, {}];
	subject.callbacks = [methods.method(args), methods.method(args)];
	subject._execute = methods.method([], { arguments: args });
	
	// act
	invoker();
});

testUtils.testWithUtils("execute", "with cancel", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbacks = [function () { ok(false); }];
	subject._execute = methods.method([], { arguments: [], cancel: true });
	
	// act
	invoker();
	ok(true);
});

testUtils.testWithUtils("dispose", null, false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbacks = {};
	subject._super = methods.method();
	
	// act
	invoker();
	
	// assert
	strictEqual(subject.callbacks.length, 0);
});