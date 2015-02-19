module("obsjs.utils.executeCallbacks, integration", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("addCallback", function() {
	// arrange
	var arg1 = {}, arg2 = {};
	var subject = new (obsjs.utils.executeCallbacks.extend(function () {this._super();}))();
	subject.addCallback(function (a1, a2) {
		strictEqual(a1, arg1);
		strictEqual(a2, arg2);
		
		subject._execute = function () {
			return null;
		};
		
		subject.execute();
		
		subject._execute = ex;
		subject.dispose();
		
		subject.throttleExecution();
		start();	// using as an assert, should not be called twice
	});
	var ex = subject._execute = function () {
		return {
			arguments: [arg1, arg2]
		};
	};
	
	// act
	subject.throttleExecution();
	subject.throttleExecution();
	subject.throttleExecution();
	stop();
	
	// assert
});