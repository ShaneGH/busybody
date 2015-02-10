
function testMe (moduleName, buildSubject) {

    module(moduleName, {
        setup: function() {
        },
        teardown: function() {
        }
    });
    
    testUtils.testWithUtils("observe", "multiple changes, 1 registration", false, function(methods, classes, subject, invoker) {
        
        // arrange
        var subject = buildSubject();
        subject.val = "aaa";
        
        obsjs.observable.observe(subject, "val", function(oldVal, newVal) {
            strictEqual(oldVal, "aaa");
            strictEqual(newVal, "ccc");
            start();
        });

        // act
        subject.val = "bbb";
        subject.val = "ccc";

        stop();
    });

    testUtils.testWithUtils("observe", "ensure changes before subscribe are not observed", false, function(methods, classes, subject, invoker) {
        
        // arrange
        var subject = buildSubject();
        obsjs.observable.observe(subject, "val", function() {});    // invoke watch function
        
        subject.val = "www";
        subject.val = "xxx";
        obsjs.observable.observe(subject, "val", function(oldVal, newVal) {
            strictEqual(oldVal, "xxx");
            strictEqual(newVal, "yyy");
            start();
        }, null, true);
        
        obsjs.observable.observe(subject, "val", function(oldVal, newVal) {
            strictEqual(oldVal, "xxx");
            strictEqual(newVal, "yyy");
            start();
        });

        // act
        subject.val = "yyy";

        stop(2);
    });

    testUtils.testWithUtils("observe", "ensure changes before dispose are observed", false, function(methods, classes, subject, invoker) {
        
        // arrange
        var subject = buildSubject();
        subject.val = "xxx";
        var disp = obsjs.observable.observe(subject, "val", function(oldVal, newVal) {
            strictEqual(oldVal, "xxx");
            strictEqual(newVal, "yyy");
            start();
        }, null, true);
        
        subject.val = "yyy"; 
        disp.dispose(true);

        // act
        subject.val = "zzz";

        stop();
    });

    testUtils.testWithUtils("observe", "2 properties", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val1 = "aaa";
        subject.val2 = "bbb";
        
        obsjs.observable.observe(subject, "val1", function(oldVal, newVal) {
            strictEqual(oldVal, "aaa");
            strictEqual(newVal, "ccc");
            start();
        });
        
        obsjs.observable.observe(subject, "val2", function(oldVal, newVal) {
            strictEqual(oldVal, "bbb");
            strictEqual(newVal, "ddd");
            start();
        });

        // act
        subject.val1 = "ccc";
        subject.val2 = "ddd";

        stop(2);
    });

    testUtils.testWithUtils("observe", "delete", false, function(methods, classes, subject, invoker) {
        // arrange    
        var subject = buildSubject();
        subject.val = "aaa";
        
        obsjs.observable.observe(subject, "val", function(oldVal, newVal) {
            strictEqual(oldVal, "aaa");
            strictEqual(newVal, undefined);
            start();
        });

        // act
        obsjs.observable.del(subject, "val");

        stop();
    });

    testUtils.testWithUtils("observe", "multiple changes, 2 registrations", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val = "aaa";

        var number = 0;
        obsjs.observable.observe(subject, "val", function(oldVal, newVal) {
            if(number === 0) {
                strictEqual(oldVal, "aaa");
                strictEqual(newVal, "bbb");
            } else if(number === 1) {
                strictEqual(oldVal, "bbb");
                strictEqual(newVal, "ccc");
            } else {
                ok(false);
            }

            number++;

            start(1);
        }, null, true);

        // act
        subject.val = "bbb";
        subject.val = "ccc";

        stop(2);
    });

    testUtils.testWithUtils("observe", "disposal", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val = "aaa";
        var dispose = obsjs.observable.observe(subject, "val", function(oldVal, newVal) {
            ok(false, "should not have been called");
        });

        // act
        dispose.dispose();
        delete subject.val;

        stop();
        setTimeout(function(){
            start();
            ok(true);
        }, 10);
    });
    
    testUtils.testWithUtils("observe", "simple change, complex functions are in pathWatch.js", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.aa = obsjs.observable.makeObservable(buildSubject());
        subject.aa.bb = obsjs.observable.makeObservable(buildSubject());
        subject.aa.bb.cc = 11;
        
        var disp = obsjs.observable.observe(subject, "aa.bb.cc", function(oldVal, newVal) {
            strictEqual(oldVal, 11);
            strictEqual(newVal, 22);
            start();
        });

        // act
        stop();
        subject.aa.bb.cc = 22;
        ok(disp instanceof obsjs.observeTypes.pathObserver);
    });
    
    testUtils.testWithUtils("observeArray", "reverse", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        
        subject.aa = new obsjs.array([1,2,3]);
        obsjs.observable.observeArray(subject, "aa", function(removed, added, moved) {
            strictEqual(removed.length, 0);
            strictEqual(added.length, 0);
            strictEqual(moved.moved.length, 2);
            
            strictEqual(moved.moved[0].from, 0);
            strictEqual(moved.moved[0].to, 2);
            
            strictEqual(moved.moved[1].from, 2);
            strictEqual(moved.moved[1].to, 0);
            start();
        });

        // act
        stop();
        subject.aa.reverse();
    });

    testUtils.testWithUtils("observeArray", "old array does not trigger change", false, function(methods, classes, subject, invoker) {
        return;
        
        // arrange
        var subject = buildSubject();
        
        var o = subject.aa = new obsjs.array([1,2,3]);
        
        obsjs.observable.observeArray(subject, "aa", function(oldV, newV) {
            strictEqual(oldV, o);
            strictEqual(newV, n);
            
            // strict equals will make sure "push" will not trigger a subscription
            obsjs.observable.afterNextObserveCycle(function () {
                o.push(33);
                obsjs.observable.afterNextObserveCycle(function () {
                    start();
                });
            });
        });

        // act
        var n = subject.aa = [];
        stop();
    });

    testUtils.testWithUtils("observe", "array, re-assign", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        var o = subject.aa = new obsjs.array([1,2,3]);
        var n = [];
        
        obsjs.observable.observe(subject, "aa", function(old, newVal) {
            strictEqual(old, o);
            strictEqual(newVal, n);
            start();
        });

        // act
        stop();
        subject.aa = n;
    });

    testUtils.testWithUtils("computed", "simple change, complex functions are in computed.js", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        if (!subject.computed) {
            ok(true, "test not valid for this object");
            return;
        }
        
        subject.val1 = buildSubject();
        subject.val1.val2 = "hello";
        subject.val3 = "world";

        var disp = subject.computed("comp", function() {
            return this.val1.val2 + " " + this.val3;
        });

        obsjs.observable.observe(subject, "comp", function(oldVal, newVal) {
            strictEqual(oldVal, "hello world");
            strictEqual(newVal, "hello shane");
            start();
        });

        // act
        stop();
        subject.val3 = "shane";
        
        // assert
        ok(disp instanceof obsjs.observeTypes.computed);
    });

    testUtils.testWithUtils("various disposals", null, false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val1 = buildSubject();
        subject.val1.val2 = "hello";
        subject.val3 = "world";
        subject.val4 = new obsjs.array();

        var isOk = true;
        if (subject.computed) {
            subject.computed("comp", function() {
                ok(isOk, "computed");
                isOk = false;

                return this.val1.val2 + " " + this.val3;
            });
        }

        obsjs.observable.observe(subject, "val3", function(oldVal, newVal) {
            ok(false, "observe property");
        });

        obsjs.observable.observe(subject, "val1.val2", function(oldVal, newVal) {
            ok(false, "observe path");
        });
        
        obsjs.observable.observeArray(subject, "val4", function(oldVal, newVal) {
            ok(false, "observeArray");
        });

        // act
        obsjs.observable.dispose(subject);
        stop();
        
        subject.val3 = "bad";
        subject.val1.val2 = "bad";
        subject.val4.push("bad");
        
        // assert
        setTimeout(function () {
            ok(true);
            start();
        }, 100);
    });
}

testMe("obsjs.observable", function() { return new obsjs.observable(); });
testMe("obsjs.observable, do not use prototype", function() { return {}; });