
function testMe (moduleName, buildSubject) {

    module(moduleName, {
        setup: function() {
        },
        teardown: function() {
        }
    });
    
    testUtils.testWithUtils("captureChanges", null, false, function(methods, classes, subject, invoker) {
        
        // arrange
        var subject = busybody.makeObservable(buildSubject());
        busybody.observe(subject, "aaa", function(){});
        busybody.observe(subject, "bbb", function(){});
        busybody.observe(subject, "ccc", function(){});
        busybody.observe(subject, "ddd", function(){});
        
        stop(busybody.useObjectObserve ? 1 : 3);
        
        var changes = [], i = 0;
        busybody.captureChanges(subject, function () {
            subject.aaa = "bbb";
            subject.bbb = "ccc";
            subject.ccc = "ddd";
        }, function (ch) {
            if (busybody.useObjectObserve) {
                strictEqual(ch.length, 3);
                
                strictEqual(ch[0].name, "aaa");
                strictEqual(ch[1].name, "bbb");
                strictEqual(ch[2].name, "ccc");            
            } else {
                strictEqual(ch.length, 1);
                
                if (i === 0) {
                    strictEqual(ch[0].name, "aaa");
                } else if (i === 1) {
                    strictEqual(ch[0].name, "bbb");
                } else if (i === 2) {
                    strictEqual(ch[0].name, "ccc"); 
                } else {
                    ok(false);
                }
                
                i++;
            }
            
            start();
        });
        
        subject.ddd = "fff";
    });
    
    testUtils.testWithUtils("captureChanges", "to property", false, function(methods, classes, subject, invoker) {
		
        // arrange
        var subject = buildSubject();
		busybody.makeObservable(subject);
        
        stop();
		
        busybody.captureChanges(subject, function () {
            subject.aaa = "111";
            subject.bbb = "222";
        }, function (ch) {
			strictEqual(ch.length, 1);
			strictEqual(ch[0].name, "aaa");
            start();
        }, "aaa");
    });
	
    testUtils.testWithUtils("captureChanges", "to complex property", false, function(methods, classes, subject, invoker) {
		
        // arrange
        var subject = buildSubject();
		busybody.makeObservable(subject);
		subject.aaa = buildSubject();
		busybody.makeObservable(subject.aaa);
        
        stop();
        
        busybody.captureChanges(subject, function () {
            subject.aaa.xxx = "111";
            subject.aaa.yyy = "222";
            subject["aaa.xxx"] = "333";
        }, function (ch) {
			strictEqual(ch.length, 1);
			strictEqual(ch[0].name, "xxx");
			strictEqual(ch[0].object, subject.aaa);
            start();
        }, "aaa.xxx");
    });
	
    testUtils.testWithUtils("bind", "left to right", false, function(methods, classes, subject, invoker) {
		
        // arrange
        var subject1 = buildSubject();
        var subject2 = buildSubject();
        
        stop();
		
        busybody.bind(subject1, "aaa", subject2, "bbb", true);
		
		busybody.observe(subject2, "bbb", function (oldVal, newVal) {
			strictEqual(newVal, 345);
			start();
		});
		
		subject1.aaa = 345;
		busybody.observe(subject1, "aaa", function (oldVal, newVal) {
			ok(false, "This should not be triggered again");
		}, {evaluateOnEachChange: true, evaluateIfValueHasNotChanged: true});
    });
	
    testUtils.testWithUtils("bind", "right to left", false, function(methods, classes, subject, invoker) {
		
        // arrange
        var subject1 = buildSubject();
        var subject2 = buildSubject();
        
        stop();
		
        busybody.bind(subject1, "aaa", subject2, "bbb", true);
		
		busybody.observe(subject1, "aaa", function (oldVal, newVal) {
			strictEqual(newVal, 345);
			start();
		});
		
		subject2.bbb = 345;
		busybody.observe(subject2, "bbb", function (oldVal, newVal) {
			ok(false, "This should not be triggered again");
		}, {evaluateOnEachChange: true, evaluateIfValueHasNotChanged: true});
    });
	
    testUtils.testWithUtils("bind", "complex, left to right", false, function(methods, classes, subject, invoker) {
		
        // arrange
        var subject1 = busybody.makeObservable(buildSubject());
        var subject2 = busybody.makeObservable(buildSubject());
        subject1.aaa = busybody.makeObservable(buildSubject());
        subject2.bbb = busybody.makeObservable(buildSubject());
        
        stop();
		
        busybody.bind(subject1, "aaa.xxx", subject2, "bbb.yyy", true);
		
		busybody.observe(subject2, "bbb.yyy", function (oldVal, newVal) {
			strictEqual(newVal, 345);
			start();
		});
		
		subject1.aaa.xxx = 345;
		busybody.observe(subject1, "aaa.xxx", function (oldVal, newVal) {
			ok(false, "This should not be triggered again");
		}, {evaluateOnEachChange: true, evaluateIfValueHasNotChanged: true});
    });
	
    testUtils.testWithUtils("bind", "complex, right to left", false, function(methods, classes, subject, invoker) {
		
        // arrange
        var subject1 = busybody.makeObservable(buildSubject());
        var subject2 = busybody.makeObservable(buildSubject())
        subject1.aaa = busybody.makeObservable(buildSubject());
        subject2.bbb = busybody.makeObservable(buildSubject());
        
        stop();
		
        busybody.bind(subject1, "aaa.xxx", subject2, "bbb.yyy", true);
		
		busybody.observe(subject1, "aaa.xxx", function (oldVal, newVal) {
			strictEqual(newVal, 345);
			start();
		});
		
		subject2.bbb.yyy = 345;
		busybody.observe(subject1, "bbb.yyy", function (oldVal, newVal) {
			ok(false, "This should not be triggered again");
		}, {evaluateOnEachChange: true, evaluateIfValueHasNotChanged: true});
    });
	
    testUtils.testWithUtils("bind", "arrays, left to right", false, function(methods, classes, subject, invoker) {
		
        // arrange
        var subject1 = buildSubject();
        var subject2 = buildSubject();
		var aaa = subject1.aaa = new busybody.array();
		var bbb = subject2.bbb = new busybody.array();
        
        stop();
        busybody.bind(subject1, "aaa", subject2, "bbb", true);
		
		subject2.bbb.observe(function () {
			strictEqual(subject2.bbb, bbb);
			strictEqual(subject2.bbb.length, 1);
			strictEqual(subject2.bbb[0], 345);
			start();
		});
		
		subject1.aaa.push(345);
		subject1.aaa.observe(function () {
			ok(false, "This should not be triggered again");
		}, {evaluateOnEachChange: true, evaluateIfValueHasNotChanged: true});
    });
	
    testUtils.testWithUtils("bind", "arrays, right to left", false, function(methods, classes, subject, invoker) {
		
        // arrange
        var subject1 = buildSubject();
        var subject2 = buildSubject();
		var aaa = subject1.aaa = new busybody.array();
		var bbb = subject2.bbb = new busybody.array();
        
        stop();
        busybody.bind(subject1, "aaa", subject2, "bbb", true);
		
		subject1.aaa.observe(function () {
			strictEqual(subject1.aaa, aaa);
			strictEqual(subject1.aaa.length, 1);
			strictEqual(subject1.aaa[0], 345);
			start();
		});
		
		subject2.bbb.push(345);
		subject2.bbb.observe(function () {
			ok(false, "This should not be triggered again");
		}, {evaluateOnEachChange: true, evaluateIfValueHasNotChanged: true});
    });
	
    testUtils.testWithUtils("bind", "array to null to array", false, function(methods, classes, subject, invoker) {
		
        // arrange
        var subject1 = buildSubject();
        var subject2 = buildSubject();
		var aaa = subject1.aaa = new busybody.array();
        
        stop();
        busybody.bind(subject1, "aaa", subject2, "bbb", true);
		
		subject1.aaa.observe(function () {
			
			strictEqual(subject1.aaa, aaa);
			strictEqual(subject1.aaa.length, 1);
			strictEqual(subject1.aaa[0], 345);
			start();
		});
		
		subject2.bbb = [345];
    });
	
    testUtils.testWithUtils("bind", "array to non array", false, function(methods, classes, subject, invoker) {
		
        // arrange
        var subject1 = buildSubject();
        var subject2 = buildSubject();
		subject1.aaa = new busybody.array();
		subject2.bbb = {};
        
		throws(function () {
        	busybody.bind(subject1, "aaa", subject2, "bbb", true);
		});
    });
    
    testUtils.testWithUtils("observe", "activate immediately", false, function(methods, classes, subject, invoker) {
		
        // arrange
        var subject = buildSubject();
        busybody.observe(subject, "val", function() {});
        subject.val = "aaa";
        
        busybody.observe(subject, "val", function(oldVal, newVal) {
            strictEqual(oldVal, undefined);
            strictEqual(newVal, "aaa");
            start();
        }, null, {activateImmediately: true});

        // act

        stop();
    });
    
    testUtils.testWithUtils("observe", "multiple changes, 1 registration", false, function(methods, classes, subject, invoker) {
        
        // arrange
        var subject = buildSubject();
        subject.val = "aaa";
        
        busybody.observe(subject, "val", function(oldVal, newVal) {
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
        busybody.observe(subject, "val", function() {});    // invoke watch function
        
        subject.val = "www";
        subject.val = "xxx";
        busybody.observe(subject, "val", function(oldVal, newVal) {
            strictEqual(oldVal, "xxx");
            strictEqual(newVal, "yyy");
            start();
        }, null, true);
        
        busybody.observe(subject, "val", function(oldVal, newVal) {
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
        var disp = busybody.observe(subject, "val", function(oldVal, newVal) {
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
        
        busybody.observe(subject, "val1", function(oldVal, newVal) {
            strictEqual(oldVal, "aaa");
            strictEqual(newVal, "ccc");
            start();
        });
        
        busybody.observe(subject, "val2", function(oldVal, newVal) {
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
        
        busybody.observe(subject, "val", function(oldVal, newVal) {
            strictEqual(oldVal, "aaa");
            strictEqual(newVal, undefined);
            start();
        });

        // act
        busybody.del(subject, "val");

        stop();
    });

    testUtils.testWithUtils("observe", "multiple changes, 2 registrations", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val = "aaa";

        var number = 0;
        busybody.observe(subject, "val", function(oldVal, newVal) {
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
        }, null, { evaluateOnEachChange: true  });

        // act
        subject.val = "bbb";
        subject.val = "ccc";

        stop(2);
    });

    testUtils.testWithUtils("observe", "useRawChanges, single", false, function(methods, classes, subject, invoker) {
		
        // arrange    
        var subject = buildSubject();
        subject.val = "aaa";
        
		var i = 0;
        var disp = busybody.observe(subject, "val", function(change) {
			if (i === 0)
				strictEqual(change.oldValue, "aaa");
			else if (i === 1)
				strictEqual(change.oldValue, "bbb");
			else
				ok(false);
				
			i++;
            start();
        }, null, {useRawChanges: true, evaluateOnEachChange:true});

        // act
		subject.val = "bbb";
		subject.val = "ccc";
		disp.dispose(true);
		subject.val = "ddd";

        stop(2);
    });

    testUtils.testWithUtils("observe", "useRawChanges, multiple", false, function(methods, classes, subject, invoker) {
		
        // arrange    
        var subject = buildSubject();
        subject.val = "aaa";
        
        var disp = busybody.observe(subject, "val", function(changes) {
			strictEqual(changes.length, 2);
			strictEqual(changes[0].oldValue, "aaa");
			strictEqual(changes[1].oldValue, "bbb");
			
            start();
        }, null, {useRawChanges: true});

        // act
		subject.val = "bbb";
		subject.val = "ccc";
		disp.dispose(true);
		subject.val = "ddd";

        stop();
    });

    testUtils.testWithUtils("observe", "disposal", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val = "aaa";
        var dispose = busybody.observe(subject, "val", function(oldVal, newVal) {
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
        subject.aa = busybody.makeObservable(buildSubject());
        subject.aa.bb = busybody.makeObservable(buildSubject());
        subject.aa.bb.cc = 11;
        
        var disp = busybody.observe(subject, "aa.bb.cc", function(oldVal, newVal) {
            strictEqual(oldVal, 11);
            strictEqual(newVal, 22);
            start();
        });

        // act
        stop();
        subject.aa.bb.cc = 22;
        ok(disp instanceof busybody.observeTypes.pathObserver);
    });
    
    testUtils.testWithUtils("observeArray", "reverse", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        
        subject.aa = new busybody.array([1,2,3]);
        busybody.observeArray(subject, "aa", function(removed, added, moved) {
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
		
        // arrange
        var subject = buildSubject();
        
        var o = subject.aa = new busybody.array([11,22,33]);
        
        var i = 0;
        busybody.observeArray(subject, "aa", function(removed, added) {
            
            strictEqual(i, 0);
            i++;
            
            strictEqual(removed.length, 2);
            strictEqual(removed[0], 11);
            strictEqual(removed[1], 33);
            
            strictEqual(added.length, 1);
            strictEqual(added[0], 55);
            
            // strict equals will make sure "push" will not trigger a subscription
            busybody.observable.afterNextObserveCycle(function () {
                o.push(33);
                busybody.observable.afterNextObserveCycle(function () {
                    start();
                });
            });
        });

        // act
        var n = subject.aa = [22, 55];
        stop();
    });

    testUtils.testWithUtils("observe", "array, re-assign", false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        var o = subject.aa = new busybody.array([1,2,3]);
        var n = [];
        
        busybody.observe(subject, "aa", function(old, newVal) {
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

        busybody.observe(subject, "comp", function(oldVal, newVal) {
            strictEqual(oldVal, "hello world");
            strictEqual(newVal, "hello shane");
            start();
        });

        // act
        stop();
        subject.val3 = "shane";
        
        // assert
        ok(disp instanceof busybody.observeTypes.computed);
    });

    testUtils.testWithUtils("various disposals", null, false, function(methods, classes, subject, invoker) {
        // arrange
        var subject = buildSubject();
        subject.val1 = buildSubject();
        subject.val1.val2 = "hello";
        subject.val3 = "world";
        subject.val4 = new busybody.array();

        var isOk = true;
        if (subject.computed) {
            subject.computed("comp", function() {
                ok(isOk, "computed");
                isOk = false;

                return this.val1.val2 + " " + this.val3;
            });
        }

        busybody.observe(subject, "val3", function(oldVal, newVal) {
            ok(false, "observe property");
        });

        busybody.observe(subject, "val1.val2", function(oldVal, newVal) {
            ok(false, "observe path");
        });
        
        busybody.observeArray(subject, "val4", function(oldVal, newVal) {
            ok(false, "observeArray");
        });

        // act
        busybody.dispose(subject);
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

testMe("busybody.observable, integration", function() { return new busybody.observable(); });
testMe("busybody.observable, integration, do not use prototype", function() { return {}; });