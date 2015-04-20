module("bb.disposable, integration", {
    setup: function() {
    },
    teardown: function() {
    }
});

var disposable = bb.disposable;

testUtils.testWithUtils("constructor", "and all functionality", false, function(methods, classes, subject, invoker) {
    // arrange
    var disposed1 = 0, disposed2 = 0, disposed3 = 0, disposed4 = 0;
    var subject = new disposable(methods.customMethod(function () { disposed1++; }));
    subject.registerDisposeCallback(methods.customMethod(function () { disposed2++; }));
    subject.registerDisposable({dispose: methods.customMethod(function () { disposed3++; }) });
    
    var disp = subject.registerDisposeCallback(function () { disposed4++; });
    
    // assert
    subject.disposeOf(disp);
    strictEqual(disposed1, 0);
    strictEqual(disposed2, 0);
    strictEqual(disposed3, 0);
    strictEqual(disposed4, 1);
    
    // act, again
    subject.dispose();
    strictEqual(disposed1, 01);
    strictEqual(disposed2, 01);
    strictEqual(disposed3, 01);
    strictEqual(disposed4, 1);
});