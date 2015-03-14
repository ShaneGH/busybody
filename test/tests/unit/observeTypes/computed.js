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

testUtils.testWithUtils("watchVariable", "too complex for unit testing", false, function(methods, classes, subject, invoker) {
	ok(true, "too complex for unit testing, lots of integration tests");
});

testUtils.testWithUtils("examineVariable", "simple", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "myVar.something";
	
	// act
	var output = invoker("myVar");
	
	// assert
	strictEqual(output.length, 1);
	strictEqual(output[0].variableName, "myVar.something");
});

testUtils.testWithUtils("examineVariable", "invalid variable", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "myVar.something";
	
	// act
	// assert
	throws(function () {
		invoker("#myVar");
	});
});

testUtils.testWithUtils("examineVariable", "variable has spaces", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "myVar.something";
	
	// act
	var output = invoker(" myVar ");
	
	// assert
	strictEqual(output.length, 1);
	strictEqual(output[0].variableName, "myVar.something");
});

testUtils.testWithUtils("examineVariable", "simple, multiple 1", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "myVar.something;myVar.something";
	
	// act
	var output = invoker("myVar");
	
	// assert
	strictEqual(output.length, 1);
	strictEqual(output[0].variableName, "myVar.something");
});

testUtils.testWithUtils("examineVariable", "simple, multiple 2", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "myVar.something;myVar.somethingElse";
	
	// act
	var output = invoker("myVar");
	
	// assert
	strictEqual(output.length, 2);
	strictEqual(output[0].variableName, "myVar.something");
	strictEqual(output[1].variableName, "myVar.somethingElse");
});

testUtils.testWithUtils("examineVariable", "char before var name", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "amyVar.something";
	
	// act
	var output = invoker("myVar");
	
	// assert
	strictEqual(output.length, 0);
});

testUtils.testWithUtils("examineVariable", "char after var name", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "myVara.something";
	
	// act
	var output = invoker("myVar");
	
	// assert
	strictEqual(output.length, 0);
});

testUtils.testWithUtils("examineVariable", "var is property 1", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "somethingElse.myVar.something";
	
	// act
	var output = invoker("myVar");
	
	// assert
	strictEqual(output.length, 0);
});

testUtils.testWithUtils("examineVariable", "var is property 2", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "somethingElse . myVar.something";
	
	// act
	var output = invoker("myVar");
	
	// assert
	strictEqual(output.length, 0);
});

testUtils.testWithUtils("examineVariable", "complex", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "myVar.something[3].somethingElse";
	
	// act
	var output = invoker("myVar");
	
	// assert
	strictEqual(output.length, 1);
	strictEqual(output[0].variableName, "myVar.something[3].somethingElse");
});

testUtils.testWithUtils("examineVariable", "with whitespace", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = " myVar . something [ 3 ] . somethingElse";
	
	// act
	var output = invoker("myVar");
	
	// assert
	strictEqual(output.length, 1);
	strictEqual(output[0].variableName, "myVar.something[3].somethingElse");
});

testUtils.testWithUtils("examineVariable", "complex analysis", false, function(methods, classes, subject, invoker) {
	// arrange
	var item1 = "myVar . something [ 3 ] . somethingElse", item2 = "myVar.something [3].somethingElse";
	subject.callbackString = " " + item1 + ";" + item2;
	
	// act
	var output = invoker("myVar", true);
	
	// assert
	strictEqual(output.length, 1);
	strictEqual(output[0].variableName, "myVar.something[3].somethingElse");
	strictEqual(output[0].complexResults.length, 2);
	strictEqual(output[0].complexResults[0].name, item1);
	strictEqual(output[0].complexResults[0].index, 1);
	strictEqual(output[0].complexResults[1].name, item2);
	strictEqual(output[0].complexResults[1].index, 1 + item1.length + 1);
});

testUtils.testWithUtils("examineArrayProperties", "simple", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "myVar[r].something[4].somethingElse";
	
	// act
	// assert
	strictEqual(invoker("myVar", 0), "something[4].somethingElse");
});

testUtils.testWithUtils("examineArrayProperties", "not found", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "myVar.something[4].somethingElse";
	
	// act
	// assert
	strictEqual(invoker("myVar", 0), undefined);
});

testUtils.testWithUtils("examineArrayProperties", "with spaces", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "myVar [ r ] . something [ 4 ] . somethingElse ";
	
	// act
	// assert
	strictEqual(invoker("myVar", 0), "something[4].somethingElse");
});

testUtils.testWithUtils("examineArrayProperties", "with index", false, function(methods, classes, subject, invoker) {
	// arrange
	subject.callbackString = "    myVar[r].something[4].somethingElse;";
	
	// act
	// assert
	strictEqual(invoker("myVar", 4), "something[4].somethingElse");
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