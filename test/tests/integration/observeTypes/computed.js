module("busybody.observeTypes.computed, integration", {
    setup: function() {
        busybody.utils.observeCycleHandler.instance.clear();
    },
    teardown: function() {
    }
});

var computed = busybody.observeTypes.computed;

testUtils.testWithUtils("integration test", "very simple change", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.val3 = "hello world";

    var comp = new busybody.observeTypes.computed(function() {
        return this.val3;
    }, {context:subject});
    
    comp.bind(subject, "comp");

    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, "hello world");
        strictEqual(newVal, "hello shane");
        
        comp.dispose();
        start();
    });

    // act
    stop();
    subject.val3 = "hello shane";
});

testUtils.testWithUtils("monitor array contents", "without [i]", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
	subject.people = new busybody.array([
		busybody.makeObservable({ age: 33 }),
		busybody.makeObservable({ age: 55 })
	]);

    var comp = new busybody.observeTypes.computed(function() {
		return this.people[1].age;
    }, {context:subject});
    
    comp.bind(subject, "comp");
	strictEqual(subject.comp, 55);
	
    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, 55);
        strictEqual(newVal, 44);
        
        comp.dispose();
        start();
    });
	
	subject.people[1].age = 44;
	
	stop();
});

testUtils.testWithUtils("monitor array contents", "simple", false, function(methods, classes, subject, invoker) {
	
	// arrange
    var subject = new busybody.observable();
	subject.prop = new busybody.observable();
	subject.prop.people = new busybody.array([
		busybody.makeObservable({ age: 33 }),
		busybody.makeObservable({ age: 55 })
	]);
	
    var comp = new busybody.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.prop.people.length; i < ii; i++)
			op += this.prop.people[i].age;
		return op;
    }, {context:subject, observeArrayElements: true});
    
    comp.bind(subject, "comp");
	strictEqual(subject.comp, 88);
	
    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, 88);
        strictEqual(newVal, 77);
        
        comp.dispose();
        start();
    });
	
	subject.prop.people[1].age = 44;
	
	stop();
});

testUtils.testWithUtils("monitor array contents", "enumerate over this", false, function(methods, classes, subject, invoker) {
	
	// arrange
    var subject = new busybody.array([
		busybody.makeObservable({ age: 33 }),
		busybody.makeObservable({ age: 55 })
	]);

	var comp = new busybody.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.length; i < ii; i++)
			op += this[i].age;
		return op;
    }, {context:subject, observeArrayElements: true});
    
    comp.bind(subject, "comp");
	strictEqual(subject.comp, 88);
	
    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, 88);
        strictEqual(newVal, 77);
        
        comp.dispose();
        start();
    });
	
	subject[1].age = 44;
	
	stop();
});

testUtils.testWithUtils("monitor array contents", "$ in property name", false, function(methods, classes, subject, invoker) {
	
	// arrange
    var subject = new busybody.observable();
	subject.$prop = new busybody.observable();
	subject.$prop.people = new busybody.array([
		busybody.makeObservable({ age: 33 }),
		busybody.makeObservable({ age: 55 })
	]);

    var comp = new busybody.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.$prop.people.length; i < ii; i++)
			op += this.$prop.people[i].age;
		return op;
    }, {context:subject, observeArrayElements: true});
    
    comp.bind(subject, "comp");
	strictEqual(subject.comp, 88);
	
    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, 88);
        strictEqual(newVal, 77);
        
        comp.dispose();
        start();
    });
	
	subject.$prop.people[1].age = 44;
	
	stop();
});

testUtils.testWithUtils("monitor array contents", "get value from array index", false, function(methods, classes, subject, invoker) {
	
	// arrange
    var subject = new busybody.observable();
	subject.prop = new busybody.observable();
	subject.prop.people = new busybody.array([
		new busybody.array([0,1,33]),
		new busybody.array([0,1,55])
	]);

    var comp = new busybody.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.prop.people.length; i < ii; i++)
			op += this.prop.people[i][2];
		return op;
    }, {context:subject, observeArrayElements: true});
    
    comp.bind(subject, "comp");
	strictEqual(subject.comp, 88);
	
    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, 88);
        strictEqual(newVal, 77);
        
        comp.dispose();
        start();
    });
	
	subject.prop.people[1].replace(2, 44);
	
	stop();
});

testUtils.testWithUtils("monitor array contents", "get initial array from array index", false, function(methods, classes, subject, invoker) {
	
	// arrange
    var subject = new busybody.observable();
	subject.prop = new busybody.array();
	subject.prop[1] = new busybody.array([
		busybody.makeObservable({ age: 33 }),
		busybody.makeObservable({ age: 55 })
	]);

    var comp = new busybody.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.prop[1].length; i < ii; i++)
			op += this.prop[1][i].age;
		return op;
    }, {context:subject, observeArrayElements: true});
    
    comp.bind(subject, "comp");
	strictEqual(subject.comp, 88);
	
    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, 88);
        strictEqual(newVal, 77);
        
        comp.dispose();
        start();
    });
	
	subject.prop[1][1].age = 44;
	
	stop();
});

testUtils.testWithUtils("monitor array contents", "2 observed properties", false, function(methods, classes, subject, invoker) {
	
	// arrange
    var subject = new busybody.observable();
	subject.prop = new busybody.observable();
	subject.prop.people = new busybody.array([
		busybody.makeObservable({ age1: 1, age2: 2 }),
		busybody.makeObservable({ age1: 3, age2: 4 })
	]);

    var comp = new busybody.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.prop.people.length; i < ii; i++)
			op += this.prop.people[i].age1 + this.prop.people[i].age2;
		return op;
    }, {context:subject, observeArrayElements: true});
    
    comp.bind(subject, "comp");
	strictEqual(subject.comp, 10);
	
    var obs = subject.observe("comp", function(oldVal, newVal) {
		obs.dispose();
        strictEqual(oldVal, 10);
        strictEqual(newVal, 20);
		
		obs = subject.observe("comp", function(oldVal, newVal) {
			obs.dispose();
			strictEqual(oldVal, 20);
			strictEqual(newVal, 120);
			
			comp.dispose();
			start();
		});
		
		subject.prop.people[0].age2 = 102
    });
	
	subject.prop.people[1].age1 = 13;
	
	stop();
});

testUtils.testWithUtils("bind non array to array", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.comp = new busybody.array([1,2,3]);
	
    subject.comp.observe(function(oldVal, newVal) {
        strictEqual(subject.comp.length, 0);
        
        comp.dispose();
        start();
    });

    var comp = new busybody.observeTypes.computed(function() {
        return null;
    }, {context:subject});
    
    comp.bind(subject, "comp");

    // act
    stop();
});

testUtils.testWithUtils("integration test", "simple change", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.val1 = new busybody.observable();
    subject.val1.val2 = "hello";
    subject.val3 = "world";

    new busybody.observeTypes.computed(function() {
        return this.val1.val2 + " " + this.val3;
    }, {context:subject}).bind(subject, "comp");

    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, "hello world");
        strictEqual(newVal, "hello shane");
        start();
    });

    // act
    stop();
    subject.val3 = "shane";
});

testUtils.testWithUtils("integration test", "multi property change", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.val1 = new busybody.observable();
    subject.val1.val2 = "hello";
    subject.val3 = "world";
    subject.something = new busybody.observable();

    new busybody.observeTypes.computed(function() {
        return this.val1.val2 + " " + this.val3;
    }, {context:subject}).bind(subject, "something.comp");

    subject.something.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, "hello world");
        strictEqual(newVal, "hello shane");
        start();
    });

    // act
    stop();
    subject.val3 = "shane";
});

testUtils.testWithUtils("integration test", "complex change", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.val1 = new busybody.observable();
    subject.val1.val2 = "hello";
    subject.val3 = "world";

    new busybody.observeTypes.computed(function() {            
        return this.val1.val2 + " " + this.val3;
    }, {context:subject}).bind(subject, "comp");

    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, "hello world");
        strictEqual(newVal, "goodbye world");
        start();
    });

    // act
    stop();
    subject.val1 = {val2: "goodbye"};
});

testUtils.testWithUtils("integration test", "array", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var subject = new busybody.observable();
    var val1 = subject.val1 = new busybody.array([0,1,2]);
    var comp = subject.comp = [];

    new busybody.observeTypes.computed(function() { 
        return this.val1;
    }, {context:subject}).bind(subject, "comp");

    // act
    function assert() {        
        strictEqual(comp, subject.comp);
        strictEqual(val1, subject.val1);
        
        strictEqual(subject.val1.length, subject.comp.length);
        for(var i = 0, ii = comp.length; i < ii; i++)
            strictEqual(comp[i], val1[i]);
    }
    
    assert();
    stop();
    
    busybody.observable.afterNextObserveCycle(function() {
        assert();
        val1.push(345);
        busybody.observable.afterNextObserveCycle(function() {
            assert();
            start();
        }, true);
    }, true);
    
    val1.reverse();
});

testUtils.testWithUtils("integration test", "array total", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var subject = new busybody.observable();
    subject.val1 = new busybody.array([0,1,2]);

    new busybody.observeTypes.computed(function() { 
        var tmp = 0;
        for(var i = 0, ii = this.val1.length; i < ii; i++)
            tmp += this.val1[i];
        
        return tmp;
    }, {context:subject}).bind(subject, "comp");

    // act
    function assert() {
        var tmp = 0;
        for(var i = 0, ii = subject.val1.length; i < ii; i++)
            tmp += subject.val1[i];
        
        strictEqual(tmp, subject.comp);
    }
    
    assert();
    stop();
    
    subject.val1.push(768);
    
    var disp = subject.observe("comp", function () {
        disp.dispose();
        assert();
        subject.val1.replace(0, 345);
        
        disp = subject.observe("comp", function () {
            disp.dispose();
        
            assert();
            start();
        });
    });
});

testUtils.testWithUtils("integration test", "two changes", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.val1 = new busybody.observable();
    subject.val1.val2 = "hello";
    subject.val3 = "world";

    new busybody.observeTypes.computed(function() {
        return this.val1.val2 + " " + this.val3;
    }, {context:subject}).bind(subject, "comp");

    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, "hello world");
        strictEqual(newVal, "goodbye shane");
        start();
    });

    // act
    stop();
    subject.val1 = {val2: "goodbye"};
    subject.val3 = "shane";

});

testUtils.testWithUtils("integration test", "strings", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.val1 = 1;

    new busybody.observeTypes.computed(function() {
        return "this.val1";
    }, {context:subject}).bind(subject, "comp");

    subject.observe("comp", function(oldVal, newVal) {
        ok(false);
    });

    // act
    stop();
    subject.val1 = 44;
    setTimeout(function() {
        ok(true);
        start();
    }, 50);        
});

testUtils.testWithUtils("integration test", "dispose", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    subject.val1 = new busybody.observable();
    subject.val1.val2 = "hello";
    subject.val3 = "world";

    var disp = new busybody.observeTypes.computed(function() {
        return this.val1.val2 + " " + this.val3;
    }, {context:subject}).bind(subject, "comp");

    subject.observe("comp", function(oldVal, newVal) {
        ok(false);
    });

    // act
    stop();
    disp.dispose();
    subject.val3 = "shane";

    setTimeout(function() {
        ok(true);
        start();
    }, 100)
});

testUtils.testWithUtils("integration test", "variable change, with $", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new busybody.observable();
    var $var1 = new busybody.observable();
    $var1.val1 = new busybody.observable();
    $var1.val1.val2 = "hello";
    $var1.val3 = "world";

    new busybody.observeTypes.computed(function() {
        return $var1.val1.val2 + " " + $var1.val3;
    }, {
        context: subject,
        watchVariables: {
            $var1: $var1
        }
    }).bind(subject, "comp");

    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, "hello world");
        strictEqual(newVal, "hello shane");
        start();
    });

    // act
    stop();
    $var1.val3 = "shane";        
});

testUtils.testWithUtils("integration test", "variable name vs property name", false, function(methods, classes, subject, invoker) {
    // arrange
    subject = new busybody.observable();
    var var1 = busybody.makeObservable({
        var2: busybody.makeObservable({
            var3: 44
        })
    });
    
    var var2 = new busybody.observable();

    new busybody.observeTypes.computed(function() {
        return var1.
        var2.var3;
    }, {
        context: subject,
        var2: var2    // watch var2
    }).bind(subject, "comp");

    subject.observe("comp", function(oldVal, newVal) {
        ok(false);
    });

    // act
    stop();
    var2.var3 = "shane";
    
    setTimeout(function() {
        ok(true);
        start();
    }, 100);
});

testUtils.testWithUtils("integration test", "variable name with character before", false, function(methods, classes, subject, invoker) {
    // arrange
    subject = new busybody.observable();
    var var1 = busybody.makeObservable({val: 2});    
    var avar1 = busybody.makeObservable({val: 3});

    new busybody.observeTypes.computed(function() {
        return avar1.val;
    }, {
        context: subject,
        var1: var1
    }).bind(subject, "comp");

    subject.observe("comp", function(oldVal, newVal) {
        ok(false);
    });

    // act
    stop();
    var1.val = "shane";
    
    setTimeout(function() {
        ok(true);
        start();
    }, 100);
});

testUtils.testWithUtils("integration test", "variable name with character after", false, function(methods, classes, subject, invoker) {
    // arrange
    subject = new busybody.observable();
    var var1 = busybody.makeObservable({val: 2});    
    var var1a = busybody.makeObservable({val: 3});

    new busybody.observeTypes.computed(function() {
        return var1a.val;
    }, {context: {
        var1: var1
    }}).bind(subject, "comp");

    subject.observe("comp", function(oldVal, newVal) {
        ok(false);
    });

    // act
    stop();
    var1.val = "shane";
    
    setTimeout(function() {
        ok(true);
        start();
    }, 100);
});

testUtils.testWithUtils("integration test", "with args", false, function(methods, classes, subject, invoker) {
    // arrange
    subject = new busybody.observable();
    var var1 = busybody.makeObservable({val: 2});  

    new busybody.observeTypes.computed(function(var1) {
        return var1.val;
    }, {
        context: subject,
        watchVariables: {
            var1: var1
        }
    }).bind(subject, "comp");

    subject.observe("comp", function(oldVal, newVal) {
        strictEqual(oldVal, 2);
        strictEqual(newVal, 3);
        start();
    });

    // act
    stop();
    var1.val = 3;
});

testUtils.testWithUtils("integration test", "with args, arg not added as watched arg", false, function(methods, classes, subject, invoker) {
    // arrange
    subject = new busybody.observable();
    var var1 = busybody.makeObservable({val: 2});  

    throws(function() {
        new busybody.observeTypes.computed(function(var1) {
            return var1.val;
        }, {context:subject}).bind(subject, "comp");
    });
});

testUtils.testWithUtils("forceObserve", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject = {
        inner: {
            val1: 22,
            val2: 33
        }
    };
    
    var comp = busybody.computed(subject, "result", function () {
        return this.inner.val1 + this.inner.val2;
    }, {forceObserve: true});
    
    // assert
    comp.onValueChanged(function (oldValue, newValue) {
        strictEqual(oldValue, 55);
        strictEqual(newValue, 77);
        
        comp.dispose();
        start();
    });
    
    // act
    subject.inner.val1 = 44;
    stop();
});