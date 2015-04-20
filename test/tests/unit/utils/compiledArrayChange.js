module("bb.utils.compiledArrayChange", {
    setup: function() {
    },
    teardown: function() {
    }
});

var compiledArrayChange = bb.utils.compiledArrayChange;

testUtils.testWithUtils("constructor, build and build indexes", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var obj = [33, 44];
    Array.observe(obj, function (changes) {        
        subject = new compiledArrayChange(changes, 0, 2);
            
        // act
        var added = subject.getAdded();
        var removed = subject.getRemoved();
        var indexes = subject.getIndexes();

        // assert
        strictEqual(added.length, 2);
        strictEqual(added[0], 11);
        strictEqual(added[1], 22);

        strictEqual(removed.length, 1);
        strictEqual(removed[0], 44);

        strictEqual(indexes.added.length, 2);
        strictEqual(indexes.added[0].value, 11);
        strictEqual(indexes.added[1].value, 22);
        strictEqual(indexes.added[0].index, 0);
        strictEqual(indexes.added[1].index, 1);

        strictEqual(indexes.removed.length, 1);
        strictEqual(indexes.removed[0].value, 44);
        strictEqual(indexes.removed[0].index, 1);

        strictEqual(indexes.moved.length, 1);
        strictEqual(indexes.moved[0].from, 0);
        strictEqual(indexes.moved[0].to, 2);
        
        start();
    });
    
    obj.splice(0, 0, 11, 22);
    obj.splice(3, 1);
    stop();
});