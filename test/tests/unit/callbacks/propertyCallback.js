module("busybody.callbacks.propertyCallback", {
    setup: function() {
    },
    teardown: function() {
    }
});

var propertyCallback = busybody.callbacks.propertyCallback;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var cb = {}, co = {}, ee = {}, en = {};
    subject._super = methods.method([ee]);
    
    // act
    invoker(cb, co, { evaluateOnEachChange: ee, evaluateIfValueHasNotChanged: en });
    
    // assert
    strictEqual(subject.callback, cb);
    strictEqual(subject.context, co);
    strictEqual(subject.evaluateIfValueHasNotChanged, en);
});

testUtils.testWithUtils("_evaluateSingle", "no next change", false, function(methods, classes, subject, invoker) {
    // arrange
    var changes = [{name: "val", oldValue: 22, object: subject}];
    subject.context = {};
    subject.val = 33;
    subject.evaluateIfValueHasNotChanged = true;
    subject.callback = {call: methods.method([subject.context, changes[0].oldValue, subject.val])};
    
    // act
    // assert
    invoker(changes, 0);    
});

testUtils.testWithUtils("_evaluateSingle", "with next change", false, function(methods, classes, subject, invoker) {
    // arrange
    var changes = [{name: "val", oldValue: 22, object: subject}, {name: "val", oldValue: 33, object: subject}];
    subject.context = {};
    subject.evaluateIfValueHasNotChanged = true;
    subject.callback = {call: methods.method([subject.context, changes[0].oldValue, changes[1].oldValue])};
    
    // act
    // assert
    invoker(changes, 0);    
});

testUtils.testWithUtils("_evaluateSingle", "with next change, old and new values the same", false, function(methods, classes, subject, invoker) {
    // arrange
    var changes = [{name: "val", oldValue: 22, object: subject}, {name: "val", oldValue: 22, object: subject}];
    subject.context = {};
    subject.evaluateIfValueHasNotChanged = false;
    
    // act
    // assert
    invoker(changes, 0);
    ok(true); // nothing to do in this case
});

testUtils.testWithUtils("_evaluateMultiple", "no next change", false, function(methods, classes, subject, invoker) {
    // arrange
    var changes = [{name: "val", oldValue: 22, object: subject}];
    subject.context = {};
    subject.val = 33;
    subject.evaluateIfValueHasNotChanged = true;
    subject.callback = {call: methods.method([subject.context, changes[0].oldValue, subject.val])};
    
    // act
    // assert
    invoker(changes, 0, 1);    
});

testUtils.testWithUtils("_evaluateMultiple", "with next change", false, function(methods, classes, subject, invoker) {
    // arrange
    var changes = [{name: "val", oldValue: 22, object: subject}, {name: "val", oldValue: 33, object: subject}];
    subject.context = {};
    subject.evaluateIfValueHasNotChanged = true;
    subject.callback = {call: methods.method([subject.context, changes[0].oldValue, changes[1].oldValue])};
    
    // act
    // assert
    invoker(changes, 0, 1);    
});

testUtils.testWithUtils("_evaluateMultiple", "with next change, old and new values the same", false, function(methods, classes, subject, invoker) {
    // arrange
    var changes = [{name: "val", oldValue: 22, object: subject}, {name: "val", oldValue: 22, object: subject}];
    subject.context = {};
    subject.evaluateIfValueHasNotChanged = false;
    
    // act
    // assert
    invoker(changes, 0, 1);
    ok(true); // nothing to do in this case
});