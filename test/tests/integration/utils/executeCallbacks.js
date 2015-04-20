module("bb.utils.executeCallbacks, integration", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("addCallback", function() {
	// arrange
	var arg1 = {}, arg2 = {};
	var subject = new (bb.utils.executeCallbacks.extend(function () {this._super();}))();
	subject.addCallback(function (a1, a2) {
		ok(subject);
		
		strictEqual(a1, arg1);
		strictEqual(a2, arg2);
		
		subject._execute = function () {
			return null;
		};
		
		subject.execute();
		
		subject._execute = ex;
		subject.dispose();
		
		subject.execute();
		
		subject = null;	// using as flag
	});
	
	var ex = subject._execute = function () {
		return {
			arguments: [arg1, arg2]
		};
	};
	
	// act
	subject.execute();
	
	// assert
});