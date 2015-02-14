module("obsjs.callbacks.changeCallback", {
    setup: function() {
    },
    teardown: function() {
    }
});

var changeCallback = obsjs.callbacks.changeCallback;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var ev = {};
    subject._super = methods.method();
    
    // act
    invoker(ev);
    
    // assert
    strictEqual(ev, subject.evaluateOnEachChange);
});

testUtils.testWithUtils("activate", null, false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = {};

    // act
    invoker(ch);
    
    // assert
    strictEqual(ch, subject._activatingChange);
});

testUtils.testWithUtils("activate", "is activated or has activating change", false, function(methods, classes, subject, invoker) {
    
    throws(function () {
        // arrange
        subject._activated = true;

        // act
        // assert
        invoker({});
    });
    
    delete subject._activated;
    throws(function () {
        // arrange
        subject._activatingChange = true;

        // act
        // assert
        invoker({});
    });
});

testUtils.testWithUtils("deactivate", "with args", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = {};
    subject._activated = true;
    
    // act
    invoker(ch);
    
    // assert
    strictEqual(ch, subject._deactivatingChange);
    ok(subject._activated);
});

testUtils.testWithUtils("deactivate", "with args", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = {};
    subject._activated = true;
    
    // act
    invoker();
    
    // assert
    ok(!subject._activated);
});

testUtils.testWithUtils("deactivate", "already deactivated", false, function(methods, classes, subject, invoker) {
    
    // arrange
    subject._deactivatingChange = true;
    
    // act
    // assert
    throws(function () {
        invoker();
    });
});

testUtils.testWithUtils("evaluateSingle", "ok", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [], index = 2;
    subject.evaluateOnEachChange = true;
    subject._activated = true;
    subject._evaluateSingle = methods.method([ch, index]);
    
    // act
    // assert
    invoker(ch, index);
});

testUtils.testWithUtils("evaluateSingle", "deactivate", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [0, 1, 345], index = 2;
    subject.evaluateOnEachChange = true;
    subject._deactivatingChange = 345;
    
    // act
    var output = invoker(ch, index);
    
    // assert
    strictEqual(output, changeCallback.dispose);
});

testUtils.testWithUtils("evaluateSingle", "already deactivated", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [], index = 2;
    subject.evaluateOnEachChange = true;
    subject._deactivatingChange = 345;
    subject._activated = false
    
    // act
    var output = invoker(ch, index);
    
    // assert
    strictEqual(output, changeCallback.dispose);
});

testUtils.testWithUtils("evaluateSingle", "un activated", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [], index = 2;
    subject.evaluateOnEachChange = true;
    
    // act
    // assert
    invoker(ch, index);
    ok(true);   // nothing happens in this test
});

testUtils.testWithUtils("evaluateSingle", "activate", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [0, 1, 345], index = 2;
    subject.evaluateOnEachChange = true;
    subject._activatingChange = 345;
    subject._evaluateSingle = methods.method([ch, index]);
    
    // act
    // assert
    invoker(ch, index);
});

testUtils.testWithUtils("evaluateMultiple", "has been activated", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [0, 1, 345];
    subject.evaluateOnEachChange = false;
    subject._activated = true;
    subject._evaluateMultiple = methods.method([ch, 0, 3]);
    
    // act
    // assert
    invoker(ch);
});

testUtils.testWithUtils("evaluateMultiple", "with deactivating change", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [0, 1, 345];
    subject.evaluateOnEachChange = false;
    subject._activated = true;
    subject._deactivatingChange = 345;
    subject._evaluateMultiple = methods.method([ch, 0, 2]);
    
    // act
    invoker(ch);
    
    // assert
    strictEqual(subject._activated, false);
    strictEqual(subject._deactivatingChange, undefined);
});

testUtils.testWithUtils("evaluateMultiple", "with activating change", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [0, 1, 345];
    subject.evaluateOnEachChange = false;
    subject._activatingChange = 1;
    subject._evaluateMultiple = methods.method([ch, 1, 3]);
    
    // act
    invoker(ch);
    
    // assert
    strictEqual(subject._activated, true);
    strictEqual(subject._activatingChange, undefined);
});

testUtils.testWithUtils("evaluateMultiple", "with activating and deactivating changes", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [0, 1, 345];
    subject.evaluateOnEachChange = false;
    subject._activatingChange = 1;
    subject._deactivatingChange = 345;
    subject._evaluateMultiple = methods.method([ch, 1, 2]);
    
    // act
    invoker(ch);
    
    // assert
    strictEqual(subject._activated, false);
    strictEqual(subject._activatingChange, undefined);
    strictEqual(subject._deactivatingChange, undefined);
});

testUtils.testWithUtils("evaluateMultiple", "with activating change after deactivating change", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [0, 1, 345];
    subject.evaluateOnEachChange = false;
    subject._activatingChange = 345;
    subject._deactivatingChange = 1;
    
    // act
    invoker(ch);
    
    // assert
    strictEqual(subject._activated, false);
    strictEqual(subject._activatingChange, undefined);
    strictEqual(subject._deactivatingChange, undefined);
});

testUtils.testWithUtils("evaluateMultiple", "not activated", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [0, 1, 345];
    subject.evaluateOnEachChange = false;
    
    // act
    invoker(ch);
    
    // assert
    ok(true);
});

testUtils.testWithUtils("evaluateMultiple", "deactivated", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var ch = [0, 1, 345];
    subject.evaluateOnEachChange = false;
    subject._activated = false;
    
    // act
    invoker(ch);
    
    // assert
    ok(true);
});