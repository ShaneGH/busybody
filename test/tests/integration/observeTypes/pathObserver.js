module("busybody.observeTypes.pathObserver, integration", {
    setup: function() {
    },
    teardown: function() {
    }
});

var pathObserver = busybody.observeTypes.pathObserver;

testUtils.testWithUtils("observe", "path, last element changed", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable;
    subject.aa = new busybody.observable;
    subject.aa.bb = new busybody.observable();
    subject.aa.bb.cc = 11;

    var dispose = new pathObserver(subject, "aa.bb.cc");
    dispose.onValueChanged(function(oldVal, newVal) {
        strictEqual(oldVal, 11);
        strictEqual(newVal, 22);
        start();
    });

    // act
    stop();
    subject.aa.bb.cc = 22;        
});

testUtils.testWithUtils("observe", "begin with null", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable;

    var dispose = new pathObserver(subject, "aa.bb.cc");
    dispose.onValueChanged(function(oldVal, newVal) {
        strictEqual(oldVal, null);
        strictEqual(newVal, 22);
        start();
    });

    // act
    stop();
    subject.aa = {
		bb: {
			cc: 22
		}
	};        
});

testUtils.testWithUtils("observe", "path, last element changed, has array", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var subject = new busybody.observable();
    subject.aa = new busybody.observable();
    subject.aa.bb = new busybody.array([{}, new busybody.observable()]);
    subject.aa.bb[1].cc = 11;

    var dispose = new pathObserver(subject, "aa.bb[1].cc");
    dispose.onValueChanged(function(oldVal, newVal) {
        strictEqual(oldVal, 11);
        strictEqual(newVal, 22);
        start();
    });

    // act
    stop();
    subject.aa.bb[1].cc = 22;        
});


testUtils.testWithUtils("observe", "path, array element changed, has array", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var subject = new busybody.observable();
    subject.aa = new busybody.observable();
    subject.aa.bb = new busybody.array([{}, new busybody.observable()]);
    subject.aa.bb[1].cc = 11;

    var dispose = new pathObserver(subject, "aa.bb[1].cc");
    dispose.onValueChanged(function(oldVal, newVal) {
        strictEqual(oldVal, 11);
        strictEqual(newVal, 22);
        start();
    });

    // act
    stop();
    subject.aa.bb.replace(1, { cc: 22 });        
});

/* not valid casse right now
testUtils.testWithUtils("observe", "path, last element is array", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.aa = new busybody.observable();
    subject.aa.bb = new busybody.array([11]);

    var dispose = new pathWatch(subject, "aa.bb", function(removed, added) {
        strictEqual(removed.length, 0);
        strictEqual(added.length, 1);
        
        strictEqual(added[0], 55);        
        
        start();
    });

    // act
    stop();
    subject.aa.bb.push(55);
}); */


testUtils.testWithUtils("observe", "path, last element changed, has non observable in path", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.aa = {};
    subject.aa.bb = new busybody.observable();
    subject.aa.bb.cc = 11;

    var dispose = new pathObserver(subject, "aa.bb.cc");
    dispose.onValueChanged(function(oldVal, newVal) {
        strictEqual(oldVal, 11);
        strictEqual(newVal, 22);
        start();
    });

    // act
    stop();
    subject.aa.bb.cc = 22;        
});

testUtils.testWithUtils("observe", "path, mid element nulled then last element changed", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    var aa = subject.aa = new busybody.observable();
    subject.aa.bb = new busybody.observable();
    subject.aa.bb.cc = 11;

    var dispose = new pathObserver(subject, "aa.bb.cc");
    dispose.onValueChanged(function(oldVal, newVal) {
        strictEqual(oldVal, 11);
        strictEqual(newVal, null);
        start();
        aa.bb.cc = 33; // make sure disposals are activated
    });

    // act
    stop(2);
    subject.aa = null;

    setTimeout(function() {
        start();
    }, 100);
});

testUtils.testWithUtils("observe", "path, mid element changed, null val", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.aa = new busybody.observable();
    subject.aa.bb = new busybody.observable();
    subject.aa.bb.cc = 11;

    var dispose = new pathObserver(subject, "aa.bb.cc");
    dispose.onValueChanged(function(oldVal, newVal) {
        strictEqual(oldVal, 11);
        strictEqual(newVal, null);
        start();
    });

    // act
    stop();
    subject.aa = {};

});

testUtils.testWithUtils("observe", "path, mid element and last element changed", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.aa = new busybody.observable();
    var bb = subject.aa.bb = new busybody.observable();
    subject.aa.bb.cc = 11;

    var newVal = new busybody.observable();
    newVal.bb = new busybody.observable();
    newVal.bb.cc = 22;

    var dispose = new pathObserver(subject, "aa.bb.cc");
    dispose.onValueChanged(function(oldVal, newVal) {
        strictEqual(oldVal, 11);
        strictEqual(newVal, 22);
        start();
    });

    // act
    stop();
    
    subject.aa = newVal;
    bb.cc = 33;
});

testUtils.testWithUtils("observe", "path, mid element changed, after disposal", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.aa = new busybody.observable();
    subject.aa.bb = new busybody.observable();
    subject.aa.bb.cc = 11;

    var newVal = new busybody.observable();
    newVal.bb = new busybody.observable();
    newVal.bb.cc = 22;

    var dispose = new pathObserver(subject, "aa.bb.cc");
    dispose.onValueChanged(function(oldVal, newVal) {
        ok(false);
    });

    // act
    stop();
    dispose.dispose();
    subject.aa = newVal;

    setTimeout(function() {
        ok(true);
        start();
    }, 100);
});