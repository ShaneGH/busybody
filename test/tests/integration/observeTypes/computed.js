module("obsjs.observeTypes.computed, integration", {
    setup: function() {
        obsjs.utils.observeCycleHandler.instance.clear();
    },
    teardown: function() {
    }
});

var computed = obsjs.observeTypes.computed;

testUtils.testWithUtils("integration test", "very simple change", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.observable();
    subject.val3 = "hello world";

    var comp = new obsjs.observeTypes.computed(function() {
        return this.val3;
    }, subject);
    
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
    var subject = new obsjs.observable();
	subject.people = new obsjs.array([
		obsjs.makeObservable({ age: 33 }),
		obsjs.makeObservable({ age: 55 })
	]);

    var comp = new obsjs.observeTypes.computed(function() {
		return this.people[1].age;
    }, subject);
    
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
    var subject = new obsjs.observable();
	subject.prop = new obsjs.observable();
	subject.prop.people = new obsjs.array([
		obsjs.makeObservable({ age: 33 }),
		obsjs.makeObservable({ age: 55 })
	]);
	
    var comp = new obsjs.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.prop.people.length; i < ii; i++)
			op += this.prop.people[i].age;
		return op;
    }, subject, {observeArrayElements: true});
    
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
    var subject = new obsjs.array([
		obsjs.makeObservable({ age: 33 }),
		obsjs.makeObservable({ age: 55 })
	]);

	var comp = new obsjs.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.length; i < ii; i++)
			op += this[i].age;
		return op;
    }, subject, {observeArrayElements: true});
    
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
    var subject = new obsjs.observable();
	subject.$prop = new obsjs.observable();
	subject.$prop.people = new obsjs.array([
		obsjs.makeObservable({ age: 33 }),
		obsjs.makeObservable({ age: 55 })
	]);

    var comp = new obsjs.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.$prop.people.length; i < ii; i++)
			op += this.$prop.people[i].age;
		return op;
    }, subject, {observeArrayElements: true});
    
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
    var subject = new obsjs.observable();
	subject.prop = new obsjs.observable();
	subject.prop.people = new obsjs.array([
		new obsjs.array([0,1,33]),
		new obsjs.array([0,1,55])
	]);

    var comp = new obsjs.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.prop.people.length; i < ii; i++)
			op += this.prop.people[i][2];
		return op;
    }, subject, {observeArrayElements: true});
    
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
    var subject = new obsjs.observable();
	subject.prop = new obsjs.array();
	subject.prop[1] = new obsjs.array([
		obsjs.makeObservable({ age: 33 }),
		obsjs.makeObservable({ age: 55 })
	]);

    var comp = new obsjs.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.prop[1].length; i < ii; i++)
			op += this.prop[1][i].age;
		return op;
    }, subject, {observeArrayElements: true});
    
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
    var subject = new obsjs.observable();
	subject.prop = new obsjs.observable();
	subject.prop.people = new obsjs.array([
		obsjs.makeObservable({ age1: 1, age2: 2 }),
		obsjs.makeObservable({ age1: 3, age2: 4 })
	]);

    var comp = new obsjs.observeTypes.computed(function() {
		var op = 0;
		for (var i = 0, ii = this.prop.people.length; i < ii; i++)
			op += this.prop.people[i].age1 + this.prop.people[i].age2;
		return op;
    }, subject, {observeArrayElements: true});
    
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
    var subject = new obsjs.observable();
    subject.comp = new obsjs.array([1,2,3]);
	
    subject.comp.observe(function(oldVal, newVal) {
        strictEqual(subject.comp.length, 0);
        
        comp.dispose();
        start();
    });

    var comp = new obsjs.observeTypes.computed(function() {
        return null;
    }, subject);
    
    comp.bind(subject, "comp");

    // act
    stop();
});

testUtils.testWithUtils("integration test", "simple change", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.observable();
    subject.val1 = new obsjs.observable();
    subject.val1.val2 = "hello";
    subject.val3 = "world";

    new obsjs.observeTypes.computed(function() {
        return this.val1.val2 + " " + this.val3;
    }, subject).bind(subject, "comp");

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
    var subject = new obsjs.observable();
    subject.val1 = new obsjs.observable();
    subject.val1.val2 = "hello";
    subject.val3 = "world";
    subject.something = new obsjs.observable();

    new obsjs.observeTypes.computed(function() {
        return this.val1.val2 + " " + this.val3;
    }, subject).bind(subject, "something.comp");

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
    var subject = new obsjs.observable();
    subject.val1 = new obsjs.observable();
    subject.val1.val2 = "hello";
    subject.val3 = "world";

    new obsjs.observeTypes.computed(function() {            
        return this.val1.val2 + " " + this.val3;
    }, subject).bind(subject, "comp");

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
    var subject = new obsjs.observable();
    var val1 = subject.val1 = new obsjs.array([0,1,2]);
    var comp = subject.comp = [];

    new obsjs.observeTypes.computed(function() { 
        return this.val1;
    }, subject).bind(subject, "comp");

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
    
    obsjs.observable.afterNextObserveCycle(function() {
        assert();
        val1.push(345);
        obsjs.observable.afterNextObserveCycle(function() {
            assert();
            start();
        }, true);
    }, true);
    
    val1.reverse();
});

testUtils.testWithUtils("integration test", "array total", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var subject = new obsjs.observable();
    subject.val1 = new obsjs.array([0,1,2]);

    new obsjs.observeTypes.computed(function() { 
        var tmp = 0;
        for(var i = 0, ii = this.val1.length; i < ii; i++)
            tmp += this.val1[i];
        
        return tmp;
    }, subject).bind(subject, "comp");

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

testUtils.testWithUtils("integration test", "array, changed to object", false, function(methods, classes, subject, invoker) {
	
    // arrange
    var subject = new obsjs.observable();
    var val1 = subject.val1 = new obsjs.array([0,1,2]);
    var comp = subject.comp = [];
	
    new obsjs.observeTypes.computed(function() {            
        return this.val1;
    }, subject).bind(subject, "comp");

    // act
    var disp = subject.observe("comp", function () {
        disp.dispose();
        strictEqual(subject.comp, val2);
        
        setTimeout(function () {
            strictEqual(subject.comp, val2);
            strictEqual(subject.comp[0], undefined);
            strictEqual(comp.length, 3);
            start();
        }, 50);
        
        val1.length = 0;
        val1.push(33);
    });
	
    var val2 = subject.val1 = {};
    
    stop();
});

testUtils.testWithUtils("integration test", "two changes", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new obsjs.observable();
    subject.val1 = new obsjs.observable();
    subject.val1.val2 = "hello";
    subject.val3 = "world";

    new obsjs.observeTypes.computed(function() {
        return this.val1.val2 + " " + this.val3;
    }, subject).bind(subject, "comp");

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
    var subject = new obsjs.observable();
    subject.val1 = 1;

    new obsjs.observeTypes.computed(function() {
        return "this.val1";
    }, subject).bind(subject, "comp");

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
    var subject = new obsjs.observable();
    subject.val1 = new obsjs.observable();
    subject.val1.val2 = "hello";
    subject.val3 = "world";

    var disp = new obsjs.observeTypes.computed(function() {
        return this.val1.val2 + " " + this.val3;
    }, subject).bind(subject, "comp");

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
    var subject = new obsjs.observable();
    var $var1 = new obsjs.observable();
    $var1.val1 = new obsjs.observable();
    $var1.val1.val2 = "hello";
    $var1.val3 = "world";

    new obsjs.observeTypes.computed(function() {
        return $var1.val1.val2 + " " + $var1.val3;
    }, subject, {
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
    subject = new obsjs.observable();
    var var1 = obsjs.makeObservable({
        var2: obsjs.makeObservable({
            var3: 44
        })
    });
    
    var var2 = new obsjs.observable();

    new obsjs.observeTypes.computed(function() {
        return var1.
        var2.var3;
    }, subject, {
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
    subject = new obsjs.observable();
    var var1 = obsjs.makeObservable({val: 2});    
    var avar1 = obsjs.makeObservable({val: 3});

    new obsjs.observeTypes.computed(function() {
        return avar1.val;
    }, subject, {
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
    subject = new obsjs.observable();
    var var1 = obsjs.makeObservable({val: 2});    
    var var1a = obsjs.makeObservable({val: 3});

    new obsjs.observeTypes.computed(function() {
        return var1a.val;
    }, {
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

testUtils.testWithUtils("integration test", "with args", false, function(methods, classes, subject, invoker) {
    // arrange
    subject = new obsjs.observable();
    var var1 = obsjs.makeObservable({val: 2});  

    new obsjs.observeTypes.computed(function(var1) {
        return var1.val;
    }, subject, {
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
    subject = new obsjs.observable();
    var var1 = obsjs.makeObservable({val: 2});  

    throws(function() {
        new obsjs.observeTypes.computed(function(var1) {
            return var1.val;
        }, subject).bind(subject, "comp");
    });
});