
module("busybody.utils.observeCycleHandler, integration", {
	setup: function() {
	},
	teardown: function() {
	}
});

testUtils.testWithUtils("placeholder", null, false, function(methods, classes, subject, invoker) {
	// arrange
	stop(5);
	
	var subject = new busybody.utils.observeCycleHandler(), sequence = 0;
	subject.beforeObserveCycle(function () {
		start();
		strictEqual(sequence, 0);
		sequence++;
	});
	subject.afterObserveCycle(function () {
		start();
		strictEqual(sequence, 2);
		sequence++;
		
		
		// act
		subject.dispose();
		subject.execute({}, start);

		// asserts in before/after observe cycle not firing
	});
	
	var ex = function () {
		start();
		strictEqual(sequence, 1);
		sequence++;
	}
	
	// act
	subject.execute(subject, start);	// should not do anything
	subject.execute({}, ex);
	
	// asserts in before/after observe cycle
});