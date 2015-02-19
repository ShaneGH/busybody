module("obsjs.utils.obj", {
    setup: function() {
    },
    teardown: function() {
    }
});

var obj = obsjs.utils.obj;

testUtils.testWithUtils("enumerateArr", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var subject = [];
    
    // act    
    invoker([1,2,3,4], function(i, j){this.push({val:i, name:j});}, subject);
    
    // assert    
    strictEqual(subject.length, 4);
    strictEqual(subject[0].name, 0);
    strictEqual(subject[0].val, 1);
    strictEqual(subject[1].name, 1);
    strictEqual(subject[1].val, 2);
    strictEqual(subject[2].name, 2);
    strictEqual(subject[2].val, 3);
    strictEqual(subject[3].name, 3);
    strictEqual(subject[3].val, 4);
});

testUtils.testWithUtils("enumerateObj", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var subject = [];
    
    // act    
    invoker({"a":1,"b": 2,"c": 3,"d": 4}, function(i, j){this.push({val:i, name:j});}, subject);
    
    // assert    
    strictEqual(subject.length, 4);
    strictEqual(subject[0].name, "a");
    strictEqual(subject[0].val, 1);
    strictEqual(subject[1].name, "b");
    strictEqual(subject[1].val, 2);
    strictEqual(subject[2].name, "c");
    strictEqual(subject[2].val, 3);
    strictEqual(subject[3].name, "d");
    strictEqual(subject[3].val, 4);
});

testUtils.testWithUtils("trim", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var string = "JKHVJKHVJKHVH";
    
    // act    
    // assert
    strictEqual(invoker("   \n\r\t" + string + "   \n\r\t"), string);
});

testUtils.testWithUtils("getObject", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var ctxt = {a:{b:{c:{d:{}}}}};
    
    // act    
    // assert    
    strictEqual(invoker("a.b.c.d", ctxt), ctxt.a.b.c.d);
});

testUtils.testWithUtils("addWithDispose", "", true, function(methods, classes, subject, invoker) {
    // arrange
	var item, arr = [item = {}];
    
    // act
	var disp = invoker(arr, item);
	
    // assert    
    strictEqual(arr.length, 2);
    strictEqual(arr[0], item);
    strictEqual(arr[1], item);
	
    
    // act
	disp.dispose();
	disp.dispose();
	
    // assert    
    strictEqual(arr.length, 1);
    strictEqual(arr[0], item);
});

testUtils.testWithUtils("createBindFunction", "bind objects with parser", true, function(methods, classes, subject, invoker) {
    // arrange
    var obj = {}, prop = "prop", newVal = {}, parsedNewVal = {};
    subject = invoker(obj, prop, methods.method([newVal], parsedNewVal));
    
    // act
    subject(null, newVal);
    
    // assert
    strictEqual(obj[prop], parsedNewVal);
});

testUtils.testWithUtils("createBindFunction", "bind arrays", true, function(methods, classes, subject, invoker) {
    // arrange
    var obj = {prop: []}, prop = "prop", newVal = [{},{},{}];
    subject = invoker(obj, prop);
    
    // act
    subject(null, newVal);
    
    // assert
    notStrictEqual(obj[prop], newVal);
    deepEqual(obj[prop], newVal);
});

testUtils.testWithUtils("createBindFunction", "bind observable arrays", true, function(methods, classes, subject, invoker) {
    // arrange
    var obj = {prop: new obsjs.array()}, prop = "prop", newVal = new obsjs.array([{},{},{}]);
    newVal.bind = methods.method([obj[prop]]);
    
    subject = invoker(obj, prop);
    
    // act
    subject(null, newVal);
    
    // assert
});

testUtils.testWithUtils("createBindFunction", "dispose", true, function(methods, classes, subject, invoker) {
    // arrange
    var obj = {prop: new obsjs.array()}, prop = "prop", newVal = new obsjs.array([{},{},{}]);
    newVal.bind = methods.method([obj[prop]], {dispose: methods.method([], null, "dispose was not called") });
    
    subject = invoker(obj, prop);
    
    // act
    subject(null, newVal)
    subject.dispose();
    
    // assert
});