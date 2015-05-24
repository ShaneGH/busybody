
module("busybody.array", {
	setup: function() {
	},
	teardown: function() {
	}
});

testUtils.testWithUtils("replace", null, false, function(methods, classes, subject, invoker) {
	// arrange
	var subject = new busybody.array([1,2,3]);
	subject.observe(function (changes) {
		strictEqual(changes.length, 1);
		
		strictEqual(changes[0].index, 1);
		strictEqual(changes[0].type, "splice");
		strictEqual(changes[0].addedCount, 1);
		strictEqual(changes[0].removed.length, 1);
		strictEqual(changes[0].removed[0], 2);		
		start();
	}, { useRawChanges: true });
	
	// act
	subject.replace(1, 4);
	stop();
	
	// assert
	strictEqual(subject[1], 4);
});

testUtils.testWithUtils("pop", null, false, function(methods, classes, subject, invoker) {
	
	// arrange
	var subject = new busybody.array([1,2,3]);
	subject.observe(function (changes) {
		strictEqual(changes.length, 1);
		
		strictEqual(changes[0].index, 2);
		strictEqual(changes[0].type, "splice");
		strictEqual(changes[0].addedCount, 0);
		strictEqual(changes[0].removed.length, 1);
		strictEqual(changes[0].removed[0], 3);		
		start();
	}, { useRawChanges: true });
	
	// act
	var op = subject.pop();
	stop();
	
	// assert
	strictEqual(op, 3);
	strictEqual(subject.length, 2);
});

testUtils.testWithUtils("shift", null, false, function(methods, classes, subject, invoker) {
	
	// arrange
	var subject = new busybody.array([1,2,3]);
	subject.observe(function (changes) {
		strictEqual(changes.length, 1);
		
		strictEqual(changes[0].index, 0);
		strictEqual(changes[0].type, "splice");
		strictEqual(changes[0].addedCount, 0);
		strictEqual(changes[0].removed.length, 1);
		strictEqual(changes[0].removed[0], 1);		
		start();
	}, { useRawChanges: true });
	
	// act
	var op = subject.shift();
	stop();
	
	// assert
	strictEqual(op, 1);
	strictEqual(subject.length, 2);
});

testUtils.testWithUtils("remove", null, false, function(methods, classes, subject, invoker) {
	// arrange
	var subject = new busybody.array([1,2,3]);
	subject.observe(function (changes) {
		strictEqual(changes.length, 1);
		
		strictEqual(changes[0].index, 1);
		strictEqual(changes[0].type, "splice");
		strictEqual(changes[0].addedCount, 0);
		strictEqual(changes[0].removed.length, 1);
		strictEqual(changes[0].removed[0], 2);		
		start();
	}, { useRawChanges: true });
	
	// act
	subject.remove(2);
	stop();
	
	// assert
	strictEqual(subject.length, 2);
});

testUtils.testWithUtils("splice", null, false, function(methods, classes, subject, invoker) {
	// arrange
	var subject = new busybody.array([1,2,3]);
	subject.observe(function (changes) {
		strictEqual(changes.length, 1);
		
		strictEqual(changes[0].index, 1);
		strictEqual(changes[0].type, "splice");
		strictEqual(changes[0].addedCount, 2);
		strictEqual(changes[0].removed.length, 1);
		strictEqual(changes[0].removed[0], 2);		
		start();
	}, { useRawChanges: true });
	
	// act
	subject.splice(1, 1, 55, 66);
	stop();
	
	// assert
	strictEqual(subject.length, 4);
	strictEqual(subject[1], 55);
	strictEqual(subject[2], 66);
});

testUtils.testWithUtils("push", null, false, function(methods, classes, subject, invoker) {
	// arrange
	var subject = new busybody.array([1,2,3]);
	subject.observe(function (changes) {
		strictEqual(changes.length, 1);
		
		strictEqual(changes[0].index, 3);
		strictEqual(changes[0].type, "splice");
		strictEqual(changes[0].addedCount, 3);
		strictEqual(changes[0].removed.length, 0);	
		start();
	}, { useRawChanges: true });
	
	// act
	subject.push(4, 5, 6);
	stop();
	
	// assert
	strictEqual(subject.length, 6);
	strictEqual(subject[3], 4);
	strictEqual(subject[4], 5);
	strictEqual(subject[5], 6);
});

testUtils.testWithUtils("reverse", "odd number", false, function(methods, classes, subject, invoker) {
	// arrange
	var subject = new busybody.array([1,2,3]);
	subject.observe(function (changes) {
		strictEqual(changes.length, 2);
		
		strictEqual(changes[0].name, "0");
		strictEqual(changes[0].type, "update");
		strictEqual(changes[0].oldValue, 1);
		
		strictEqual(changes[1].name, "2");
		strictEqual(changes[1].type, "update");
		strictEqual(changes[1].oldValue, 3);
		start();
	}, { useRawChanges: true });
	
	// act
	subject.reverse();
	stop();
	
	// assert
	strictEqual(subject.length, 3);
	strictEqual(subject[0], 3);
	strictEqual(subject[1], 2);
	strictEqual(subject[2], 1);
});

testUtils.testWithUtils("reverse", "even number", false, function(methods, classes, subject, invoker) {
	// arrange
	var subject = new busybody.array([1,2,3,4]);
	subject.observe(function (changes) {
		strictEqual(changes.length, 4);
		
		strictEqual(changes[0].name, "0");
		strictEqual(changes[0].type, "update");
		strictEqual(changes[0].oldValue, 1);
		
		strictEqual(changes[2].name, "1");
		strictEqual(changes[2].type, "update");
		strictEqual(changes[2].oldValue, 2);
		
		strictEqual(changes[3].name, "2");
		strictEqual(changes[3].type, "update");
		strictEqual(changes[3].oldValue, 3);
		
		strictEqual(changes[1].name, "3");
		strictEqual(changes[1].type, "update");
		strictEqual(changes[1].oldValue, 4);
		start();
	}, { useRawChanges: true });
	
	// act
	subject.reverse();
	stop();
	
	// assert
	strictEqual(subject.length, 4);
	strictEqual(subject[0], 4);
	strictEqual(subject[1], 3);
	strictEqual(subject[2], 2);
	strictEqual(subject[3], 1);
});

testUtils.testWithUtils("sort", "cannot test this to0 rigourously. Observe and non observe implementations will differ slightly", false, function(methods, classes, subject, invoker) {
	// arrange
	var subject = new busybody.array([1,3,2]);
	subject.observe(function (changes) {
		
		var ch = [];
		for (var i = 0, ii = changes.length; i < ii; i++) {
			ch.push(changes[i].name);
		}
		
		ok(ch.indexOf("1") !== -1);
		ok(ch.indexOf("2") !== -1);
		start();
	}, { useRawChanges: true });
	
	// act
	subject.sort(function (a, b) { return a > b; });
	stop();
	
	// assert
	strictEqual(subject.length, 3);
	strictEqual(subject[0], 1);
	strictEqual(subject[1], 2);
	strictEqual(subject[2], 3);
});