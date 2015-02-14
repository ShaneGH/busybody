module("obsjs.observeTypes.pathObserver", {
    setup: function() {
    },
    teardown: function() {
    }
});

var pathObserver = obsjs.observeTypes.pathObserver;

testUtils.testWithUtils("onValueChanged", null, false, function(methods, classes, subject, invoker) {
    // arrange
    subject.val = {};
    var disp = {}, cb = methods.method([undefined, subject.val]);
    subject.observe = methods.method(["val", cb], disp);
    subject.registerDisposable = methods.method([disp]);
    
    // act
    // assert
    invoker(cb, true);
});

testUtils.testWithUtils("execute", null, false, function(methods, classes, subject, invoker) {
    // arrange
    subject.forObject = {
        aa: {bb: {cc: 22}}
    };
    subject.path = ["aa", "bb", "cc"];
    
    // act
    var op = invoker();
    
    // assert
    strictEqual(op, 22);
});