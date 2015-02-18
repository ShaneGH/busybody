module("obsjs.observeTypes.computed", {
    setup: function() {
    },
    teardown: function() {
    }
});

var computed = obsjs.observeTypes.computed;

testUtils.testWithUtils("testForWith", "ok, with variable name", true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    // assert
    ok(!invoker((function () {
        myVar.with;
    }).toString()));
});

testUtils.testWithUtils("testForWith", "ok, with partial variable name", true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    // assert
    ok(!invoker((function () {
        myVar.sandwith;        
    }).toString()));
});

testUtils.testWithUtils("testForWith", "not ok", true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    // assert
    ok(invoker((function () {
        with (myVar) {}
    }).toString()));
});

testUtils.testWithUtils("stripFunction", "block comments", true, function(methods, classes, subject, invoker) {
    // arrange
    
    var begin = "begin\n",
        end = "\nend",
        strip = "/* strip */";    
        
    // act
    var output = invoker(begin + strip + end);
    
    // assert
    strictEqual(output, begin + end);
});

testUtils.testWithUtils("stripFunction", "inline comments", true, function(methods, classes, subject, invoker) {
    // arrange
    
    var begin = "begin",
        end = "\nend",
        strip = "//strip"; 
        
    // act
    var output = invoker(begin + strip + end);
    
    // assert
    strictEqual(output, begin + end);
});

testUtils.testWithUtils("stripFunction", "string \"", true, function(methods, classes, subject, invoker) {
    // arrange
    
    var begin = "begin",
        end = "\nend",
        strip = '"strip \' \\""'; 
        
    // act
    var output = invoker(begin + strip + end);
    
    // assert
    strictEqual(output, begin + "#" + end);
});

testUtils.testWithUtils("stripFunction", "string '", true, function(methods, classes, subject, invoker) {
    // arrange
    
    var begin = "begin",
        end = "\nend",
        strip = "'strip \" \\''"; 
        
    // act
    var output = invoker(begin + strip + end);
    
    // assert
    strictEqual(output, begin + "#" + end);
});

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var callback = {}, context = {}, options = { watchVariables: {arg1: {}}, allowWith: false }, stripedCallback = "(arg1)";
    subject._super = methods.method();
    subject.execute = methods.method();
    classes.mock("obsjs.observeTypes.computed.stripFunction", function () {
        methods.method([callback])(arguments[0]);
        return stripedCallback;
    }, 1);
    var count = 0;
    subject.watchVariable = methods.dynamicMethod(function () {
        ok(count < 2);
        count++;
        return count === 1 ? ["this", context] : ["arg1", options.watchVariables.arg1];
    }, null, "watchVariable");
    
    
    // act
    invoker(callback, context, options);
    
    // assert
    strictEqual(subject.arguments.constructor, Array);
    strictEqual(subject.callbackString, stripedCallback);
    strictEqual(subject.context, context);
    strictEqual(subject.arguments.constructor, Array);
});

testUtils.testWithUtils("constructor", "has un allowed with", false, function(methods, classes, subject, invoker) {
    // arrange
    function callback () { with (callback) {}}
    subject._super = function(){};
    subject.execute = function(){};
    subject.watchVariable = function(){}
    
    
    // act
    // assert
    throws(function() {
        invoker(callback);
    });    
});

testUtils.testWithUtils("constructor", "has allowed with", false, function(methods, classes, subject, invoker) {
    // arrange
    function callback () { with (callback) {}}
    subject._super = function(){};
    subject.execute = function(){};
    subject.watchVariable = function(){}
    
    
    // act
    // assert
    invoker(callback, null, {allowWith: true});
    ok(true);
});

testUtils.testWithUtils("constructor", "has un allowed argument", false, function(methods, classes, subject, invoker) {
    // arrange
    function callback (arg) {}
    subject._super = function(){};
    subject.execute = function(){};
    subject.watchVariable = function(){}
    
    
    // act
    // assert
    throws(function() {
        invoker(callback);
    });    
});

testUtils.testWithUtils("execute", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var ensure = methods.method(), result = {};
    subject.callbackFunction = function () {
        ensure();
        strictEqual(arguments[0], subject.arguments[0]);
        strictEqual(arguments[1], subject.arguments[1]);
        strictEqual(this, subject.context);
        return result;
    };
    subject.arguments = [{},{}];
    subject.context = {};
    
    // act
    invoker();
    
    // assert
    strictEqual(subject.val, result);
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

testUtils.testWithUtils("bind", "bind and dispose", false, function(methods, classes, subject, invoker) {
    // arrange	
    subject.val = {};
    var obj = {}, prop = {}, cb = {}, op = {
		registerDisposable: methods.method([cb])
	};
    classes.mock("obsjs.observeTypes.computed.createBindFunction", function (o, p) {
        methods.method([obj, prop])(o, p);
        return cb;
    }, 1);
	
	subject.onValueChanged = methods.method([cb, true], op);
    
    // act
    var output = invoker(obj, prop);
    
    // assert
	strictEqual(op, output);
});

testUtils.testWithUtils("onValueChanged", null, false, function(methods, classes, subject, invoker) {
	
    // arrange
	subject.val = {};
	var callback = methods.method([undefined, subject.val]);
	subject.bound = [];
	subject.registerDisposable = methods.customMethod(function (arg) { strictEqual(arg.constructor, obsjs.disposable); });
    
    // act
    var op = invoker(callback, true);
    
    // assert
    strictEqual(subject.bound[0], callback);
	
	
	// act
	op.dispose();
    
    // assert
    strictEqual(subject.bound.length, 0);
	
});

testUtils.testWithUtils("onValueChanged", null, false, function(methods, classes, subject, invoker) {
    // arrange
    ok("too complex for unit testing, fully tested in integration testing");
});

testUtils.testWithUtils("throttleExecution", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var i = 0;
    subject.execute = function () { strictEqual(i, 0); i++; start(); };
    
    // act
    invoker();
    invoker();
    stop();
    
    // assert
});

testUtils.testWithUtils("isArray and nonArrayType", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var array = objjs.object.extend.call(Array, function(){});
    var nonArray = objjs.object.extend.call(Array, function(){});
    computed.nonArrayType(nonArray);
    
    // act
    // assert
    ok(computed.isArray([]));
    ok(computed.isArray(new array()));
    ok(!computed.isArray(new nonArray()));
});