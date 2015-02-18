module("obsjs.observeTypes.pathObserver", {
    setup: function() {
    },
    teardown: function() {
    }
});

var pathObserver = obsjs.observeTypes.pathObserver;

testUtils.testWithUtils("execute", null, false, function(methods, classes, subject, invoker) {
    // arrange
    subject.forObject = {
        aa: {bb: {cc: 22}}
    };
    subject.path = ["aa", "bb", "cc"];
    
    // act
    invoker();
    
    // assert
    strictEqual(subject.val, 22);
});