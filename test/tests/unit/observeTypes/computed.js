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

testUtils.testWithUtils("watchVariable", "has un allowed argument", false, function(methods, classes, subject, invoker) {
	ok(true, "too complex for unit testing");
});

testUtils.testWithUtils("getValue", null, false, function(methods, classes, subject, invoker) {
    // arrange
	var ctxt = {}, args = {}, op = {};
	subject.callbackFunction = {
		apply: methods.method([ctxt, args], op)
	};
	subject.context = ctxt;
	subject.arguments = args;
    
    // act
    var output = invoker();
    
    // assert
    strictEqual(output, op);
});

testUtils.testWithUtils("bind", "bind and dispose", false, function(methods, classes, subject, invoker) {
    // arrange	
    subject.val = {};
    var obj = {}, prop = {}, cb = {}, op = {
		registerDisposable: methods.method([cb])
	};
    classes.mock("obsjs.utils.obj.createBindFunction", function (o, p) {
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
	var val = subject.val = {}, cb = methods.method([undefined, val]), op = {};
	subject.addCallback = methods.method([cb], op);
    
    // act
    var output = invoker(cb, true);
    
    // assert
    strictEqual(op, output);
	
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