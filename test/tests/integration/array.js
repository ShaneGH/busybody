
module("obsjs.array, integration", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("observe", "add", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array();

    var val = {};
    subject.observe(function(removed, added, indexes) {
        
        strictEqual(removed.length, 0);
        strictEqual(added.length, 1);
        strictEqual(added[0], val);
        
        strictEqual(indexes.removed.length, 0);
        strictEqual(indexes.moved.length, 0);
        strictEqual(indexes.added.length, 1);
        strictEqual(indexes.added[0].index, 0);
        strictEqual(indexes.added[0].value, val);
        
        start();
    });

    // act
    subject.push(val);

    stop();
});


testUtils.testWithUtils("observe", "add duplicate", false, function(methods, classes, subject, invoker) {
    // arrange
    var val = {};
    var subject = new obsjs.array([val]);

    subject.observe(function(removed, added, indexes) {
        strictEqual(removed.length, 0);
        strictEqual(added.length, 1);
        strictEqual(added[0], val);
        
        strictEqual(indexes.removed.length, 0);
        strictEqual(indexes.moved.length, 0);
        strictEqual(indexes.added.length, 1);
        strictEqual(indexes.added[0].index, 1);
        strictEqual(indexes.added[0].value, val);
        
        start();
    });

    // act
    subject.push(val);

    stop();
});

testUtils.testWithUtils("observe", "subscribe and unsubscribe", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array();

    subject.observe(function(removed, added, indexes) {
        ok(false);
    }).dispose(true);

    // act
    subject.push(1);
    obsjs.observable.afterNextObserveCycle(function () {
        ok(true);
        start();
    }, true);

    stop();
});

testUtils.testWithUtils("observe", "property change", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array();
    subject.val = 22;
    
    subject.observe("val", function(oldVal, newVal) {
        strictEqual(oldVal, 22);
        strictEqual(newVal, 33);
        
        start();
    });

    // act
    subject.val = 33;;

    stop();
});

testUtils.testWithUtils("observe", "ensure changes before observe are not noticed. Simple", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var subject = new obsjs.array(["aa","bb","cc"]);
    subject._init();
    
    // act
    subject.reverse();
    
    // assert
    subject.observe(function() {
        ok(false);
    });
    
    obsjs.observable.afterNextObserveCycle(function () {
        ok(true);
        start();
    }, true);
    
    stop();
});

testUtils.testWithUtils("observe", "ensure changes before observe are not noticed. Complex", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array();
    subject.push(55);
    
    subject.observe(function(removed, added, indexes) {
        strictEqual(added.length, 2);
        strictEqual(added[0], 66);
        strictEqual(added[1], 77);
        
        strictEqual(removed.length, 0);
        
        strictEqual(indexes.added.length, 2);
        strictEqual(indexes.added[0].index, 1);
        strictEqual(indexes.added[0].value, 66);
        strictEqual(indexes.added[1].index, 2);
        strictEqual(indexes.added[1].value, 77);
        
        start();
    });
    
    var count1 = 0;
    subject.observe(function(change) {
        ok(count1 < 2);
        count1++;
        
        strictEqual(change.index, count1);
        
        start();
    }, null, true);
    
    subject.push(66);
    
    subject.observe(function(removed, added, indexes) {
        strictEqual(added.length, 1);
        strictEqual(added[0], 77);
        
        strictEqual(removed.length, 0);
        
        strictEqual(indexes.added.length, 1);
        strictEqual(indexes.added[0].index, 2);
        strictEqual(indexes.added[0].value, 77);
        
        start();
    });
    
    var count2 = 0;
    subject.observe(function(change) {
        strictEqual(count2, 0);
        count2++;
        
        strictEqual(change.index, 2);
        start();
    }, null, true);
    
    subject.push(77);

    // act
    stop(5);
});

testUtils.testWithUtils("observe", "replace, length doesn't change", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array([1,2,3]);

    var val = {};
    subject.observe(function(removed, added) {
        strictEqual(removed.length, 1);
        strictEqual(removed[0], 2);
        strictEqual(added.length, 1);
        strictEqual(added[0], 4);
        
        strictEqual(subject.length, 3);        
        start();
    });

    // act
    subject.replace(1, 4);

    stop();
});

testUtils.testWithUtils("observe", "replace, length changes", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array([1,2,3]);

    var val = {};
    subject.observe(function(removed, added) {
        strictEqual(removed.length, 0);
        strictEqual(added.length, 1);
        strictEqual(added[0], 4);
        
        strictEqual(subject.length, 4);        
        start();
    });

    // act
    subject.replace(3, 4);

    stop();
});

testUtils.testWithUtils("observe", "add then remove", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array();

    var val = {};
    subject.observe(function(removed, added, indexes) {
        strictEqual(removed.length, 0);
        strictEqual(added.length, 0);
        
        start();
    });

    // act
    subject.push(val);
    subject.length = 0;

    stop();
});

testUtils.testWithUtils("observe", "add then splice", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array();

    var val0 = {}, val1 = {};
    subject.observe(function(removed, added, indexes) {
        strictEqual(added.length, 2);
        strictEqual(added[0], val0);
        strictEqual(added[1], val1);
        
        strictEqual(indexes.added.length, 2);
        strictEqual(indexes.added[0].value, val1);
        strictEqual(indexes.added[0].index, 0);
        
        strictEqual(indexes.added[1].value, val0);
        strictEqual(indexes.added[1].index, 1);
        
        start();
    });

    // act
    subject.push(val0);
    subject.splice(0, 0, val1);

    stop();
});

testUtils.testWithUtils("observe", "add then replace", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array();

    var val0 = {}, val1 = {};
    subject.observe(function(removed, added, indexes) {
        strictEqual(added.length, 1);
        strictEqual(added[0], val0);
        
        strictEqual(indexes.added.length, 1);
        strictEqual(indexes.added[0].value, val0);
        strictEqual(indexes.added[0].index, 0);
        
        start();
    });

    // act
    subject.push(val1);
    subject.splice(0, 1, val0);

    stop();
});

testUtils.testWithUtils("observe", "length decrease", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array([3, 4, 5]);

    subject.observe(function(removed, added, indexes) {
        strictEqual(removed.length, 1);
        strictEqual(removed[0], 5);
        
        strictEqual(added.length, 0);
        
        strictEqual(indexes.added.length, 0);
        strictEqual(indexes.moved.length, 0);
        strictEqual(indexes.removed.length, 1);
        strictEqual(indexes.removed[0].index, 2);
        strictEqual(indexes.removed[0].value, 5);
        
        start();
    });
    
    subject.observe(function(change) {
        strictEqual(change.addedCount, 0);
        strictEqual(change.index, 2);
        strictEqual(change.object, subject);
        strictEqual(change.removed.length, 1);
        strictEqual(change.removed[0], 5);
        strictEqual(change.type, "splice");

        start();
    }, null, true);

    // act
    subject.length = 2;
    strictEqual(subject.length, 2);
    strictEqual(subject[2], undefined);
    
    stop(2);
});

testUtils.testWithUtils("observe", "length increase", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array([3, 4, 5]);

    subject.observe(function(removed, added, indexes) {
        strictEqual(added.length, 1);
        strictEqual(added[0], undefined);
        
        strictEqual(removed.length, 0);        
        
        strictEqual(indexes.removed.length, 0);
        strictEqual(indexes.moved.length, 0);
        strictEqual(indexes.added.length, 1);
        strictEqual(indexes.added[0].index, 3);
        strictEqual(indexes.added[0].value, undefined);
        
        start();
    });
    
    subject.observe(function(change) {
        strictEqual(change.addedCount, 1);
        strictEqual(change.index, 3);
        strictEqual(change.object, subject);
        strictEqual(change.removed.length, 0);
        strictEqual(change.type, "splice");

        start();
    }, null, true);

    // act
    subject.length = 4;
    strictEqual(subject.length, 4);
    strictEqual(subject[3], undefined);
    
    stop(2);
});

testUtils.testWithUtils("observe", "splice", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var subject = new obsjs.array([1, 2, 3]);

    var val1 = 44, val2 = 55;
    subject.observe(function(removed, added, indexes) {
        strictEqual(removed.length, 1);
        strictEqual(removed[0], 2);
        strictEqual(added.length, 2);
        strictEqual(added[0], val1);
        strictEqual(added[1], val2);
        
        strictEqual(indexes.removed.length, 1);
        strictEqual(indexes.removed[0].index, 1);
        strictEqual(indexes.removed[0].value, 2);
        
        strictEqual(indexes.added.length, 2);
        strictEqual(indexes.added[0].index, 1);
        strictEqual(indexes.added[0].value, val1);
        strictEqual(indexes.added[1].index, 2);
        strictEqual(indexes.added[1].value, val2);
        
        strictEqual(indexes.moved.length, 1);
        strictEqual(indexes.moved[0].from, 2);
        strictEqual(indexes.moved[0].to, 3);
        strictEqual(indexes.moved[0].value, 3);
        
        start();
    });

    // act
    subject.splice(1, 1, val1, val2);

    stop();
});

testUtils.testWithUtils("observe", "disposal", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array();

    var val = {};
    var dispose = subject.observe(function(removed, added) {
        ok(false, "should not have been called");
    });

    // act
    dispose.dispose();
    subject.push(val);

    stop();
    setTimeout(function(){
        start();
        ok(true);
    }, 10);
});

testUtils.testWithUtils("observe", "two reservations", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array();

    var val = {};
    var obs = function(removed, added) {
        strictEqual(removed.length, 0);
        strictEqual(added.length, 1);
        strictEqual(added[0], val);
        start();
    };
    
    subject.observe(obs);
    subject.observe(obs);

    // act
    subject.push(val);

    stop(2);
});

testUtils.testWithUtils("observe", "two changes, two observations, 1 complex, one simple", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array();

    var val1 = {}, val2 = {};
    
    var done = 0;
    subject.observe(function(removed, added) {
        strictEqual(removed.length, 0);
        strictEqual(added.length, 2);
        strictEqual(added[0], val1);
        strictEqual(added[1], val2);
        
        strictEqual(done, 2);
        start();
    });
    
    subject.observe(function(change) {
        strictEqual(change.addedCount, 1);
        strictEqual(change.index, done); // hack, "done" is also functioning as index of last item
        strictEqual(change.object, subject);
        strictEqual(change.removed.length, 0);
        strictEqual(change.type, "splice");

        done++;
        start();
    }, null, true);

    // act
    subject.push(val1);
    subject.push(val2);

    stop(3);
});

testUtils.testWithUtils("observe", "pop", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array([4, 5]);
    
    subject.observe(function(removed, added) {
        strictEqual(removed.length, 1);
        strictEqual(added.length, 0);
        strictEqual(removed[0], 5);
        start();
    });
    
    subject.observe(function(change) {
        strictEqual(change.addedCount, 0);
        strictEqual(change.object, subject);
        strictEqual(change.removed.length, 1);
        strictEqual(change.removed[0], 5);
        strictEqual(change.index, 1);
        strictEqual(change.type, "splice");
        
        start();
    }, null, true);

    // act
    var result = subject.pop();
    stop(2);

    // assert
    strictEqual(result, 5);
    strictEqual(subject.length, 1);
});

testUtils.testWithUtils("observe", "shift", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array([4, 5]);
    
    subject.observe(function(removed, added) {
        strictEqual(removed.length, 1);
        strictEqual(added.length, 0);
        strictEqual(removed[0], 4);
        start();
    });
    
    subject.observe(function(change) {
        strictEqual(change.addedCount, 0);
        strictEqual(change.object, subject);
        strictEqual(change.removed.length, 1);
        strictEqual(change.removed[0], 4);
        strictEqual(change.index, 0);
        strictEqual(change.type, "splice");
        
        start();
    }, null, true);

    // act
    var result = subject.shift();
    stop(2);

    // assert
    strictEqual(result, 4);
    strictEqual(subject.length, 1);
});

testUtils.testWithUtils("remove", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.array([3, 4, 5]);

    // act
    subject.remove(4);

    // assert
    strictEqual(subject.length, 2);
    strictEqual(subject[0], 3);
    strictEqual(subject[1], 5);
});

testUtils.testWithUtils("bind", "length change", false, function(methods, classes, subject, invoker) {
    //TODO: make this test ore complex,:
    //    test 2: with 2 way bindings
    
    // arrange
    var subject = new obsjs.array([1,2,3]);
    var another = [];

    var val = {};
    
    obsjs.observable.afterNextObserveCycle(function () {
        strictEqual(subject.length, 2);
        assert();
        start();
    }, true);

    // act
    subject.bind(another);
    
    // assert
    function assert() {
        strictEqual(subject.length, another.length);
        for(var i = 0, ii = subject.length; i < ii; i++)
            strictEqual(subject[i], another[i]);
    }
    
    assert();
    subject.length = 2;
    stop();
});

testUtils.testWithUtils("bind", "2 splices", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var subject = new obsjs.array([1,2,3,4,5,6,7,8,9]);
    var another = [];

    var val = {};
    
    obsjs.observable.afterNextObserveCycle(function () {
        strictEqual(subject.length, 8);
        assert();
        start();
    }, true);

    // act
    subject.bind(another);
    
    // assert
    function assert() {
        strictEqual(subject.length, another.length);
        for(var i = 0, ii = subject.length; i < ii; i++)
            strictEqual(subject[i], another[i]);
    }
    
    assert();
    subject.splice(3, 3);
    subject.splice(5, 0, 99, 88);
    stop();
});

testUtils.testWithUtils("bind", "2 way, simple", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var subject = new obsjs.array([1,2,3]);
    var another = new obsjs.array();
    subject.name = "changed";
    another.name = "change target";
    
    var val = {};
    
    obsjs.observable.afterNextObserveCycle(function () {
        strictEqual(subject.length, 2);
        assert();
        start();
    }, true);

    // act
    subject.bind(another);
    another.bind(subject);
    
    // assert
    function assert() {
        strictEqual(subject.length, another.length);
        for(var i = 0, ii = subject.length; i < ii; i++)
            strictEqual(subject[i], another[i]);
    }
    
    assert();
    subject.splice(0, 1);
    stop();
});

testUtils.testWithUtils("bind", "2 way bindings, complex", false, function(methods, classes, subject, invoker) {
        
    //TODO: dispose test
    // arrange
    var subject = new obsjs.array([1,2,3,4,5,6,7,8,9]);
    subject.name = "subject";
    var another = new obsjs.array();
    another.name = "another";
    
    var val = {};
    
    obsjs.observable.afterNextObserveCycle(function () {
        strictEqual(subject.length, 8);
        assert();
    window.ssstttoooppp = true;
        subject.splice(2, 2, 99, 110);
        obsjs.observable.afterNextObserveCycle(function () {
            strictEqual(another.length, 8);
            assert();
            start();
        }, true);
    }, true);

    // act
    subject.bind(another);
    another.bind(subject);
    
    // assert
    function assert() {
        strictEqual(subject.length, another.length);
        for(var i = 0, ii = subject.length; i < ii; i++)
            strictEqual(subject[i], another[i]);
    }
    
    assert();
    another.splice(3, 3);
    another.splice(5, 0, 99, 88);
    stop();
});

testUtils.testWithUtils("bind", "with adds on pending queue", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var subject = new obsjs.array();
    subject.push(1);
    subject.push(2);
    subject.push(3);

    var another = [];
    
    obsjs.observable.afterNextObserveCycle(function () {
        strictEqual(subject.length, 3);
        assert();
        start();
    }, true);

    // act
    subject.bind(another);
    
    // assert
    var round = 0;
    function assert() {
        round++;
        
        strictEqual(subject.length, another.length, "round " + round + ", length");
        for(var i = 0, ii = subject.length; i < ii; i++)
            strictEqual(subject[i], another[i], "round " + round + ", index: " + i);
    }
    
    assert();
    stop();
    
    // ensure afterNextObserveCycle is fired
    var t = new obsjs.observable();
    t.observe("aa", function(){});
    t.aa = "KJBKJ";
});

testUtils.testWithUtils("bind", "with moves on pending queue", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var subject = new obsjs.array(["aa","bb","cc"]);
    subject.reverse();

    var another = [];
    
    obsjs.observable.afterNextObserveCycle(function () {
        strictEqual(subject.length, 3);
        assert();
        start();
    }, true);

    // act
    subject.bind(another);
    
    // assert
    var round = 0;
    function assert() {
        round++;
        
        strictEqual(subject.length, another.length, "round " + round + ", length");
        for(var i = 0, ii = subject.length; i < ii; i++)
            strictEqual(subject[i], another[i], "round " + round + ", index: " + i);
    }
    
    assert();
    stop();
    
    // ensure afterNextObserveCycle is fired
    var t = new obsjs.observable();
    t.observe("aa", function(){});
    t.aa = "KJBKJ";
});