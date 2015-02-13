module("obsjs.observeTypes.computed", {
    setup: function() {
    },
    teardown: function() {
    }
});

var computed = obsjs.observeTypes.computed;

//TODO: move to unit tests
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
    var callback = {}, context = {}, watchVariables = {arg1: {}}, callbackStringOverride = "asdasds", allowWith = false, stripedCallback = "(arg1)";
    subject._super = methods.method();
    subject.execute = methods.method();
    classes.mock("obsjs.observeTypes.computed.stripFunction", function () {
        methods.method([callbackStringOverride])(arguments[0]);
        return stripedCallback;
    }, 1);
    var count = 0;
    subject.watchVariable = methods.dynamicMethod(function () {
        ok(count < 2);
        count++;
        return count === 1 ? ["this", context] : ["arg1", watchVariables.arg1];
    }, null, "watchVariable");
    
    
    // act
    invoker(callback, context, watchVariables, callbackStringOverride, allowWith);
    
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
    invoker(callback, null, null, null, true);
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

function a() {
        
        this._super();
        
        this.arguments = [];
        
        this.callbackString = computed.stripFunction(callbackStringOverride || callback);
        this.callbackFunction = callback;
        this.context = context;
        
        if (!allowWith)
            if (WITH.test(this.callbackString))
                throw "You cannot use the \"with\" keyword in computed functions by default. To allow with, use the allowWith argument on the constructor, however, properties of the variable within the \"with\" statement cannot be monitored for change.";
                
        // get all argument names
        var args = this.callbackString.slice(
            this.callbackString.indexOf('(') + 1, this.callbackString.indexOf(')')).match(GET_ARGUMENT_NAMES) || [], completeArg = {};
        
        // get all watch variables which are also arguments
        if (watchVariables && args.length) {            
            var tmp;
            for (var i in watchVariables) {
                // if variable is an argument, add it to args
                if ((tmp = args.indexOf(i)) !== -1) {
                    this.arguments[tmp] = watchVariables[i];
                    args[tmp] = completeArg;
                }
            }
        }
        
        // checking that all args have been set
        enumerateArr(args, function(arg) {
            if (arg !== completeArg)
                throw "Argument \"" + arg + "\" must be added as a watch variable.";
        });
        
        this.execute();
        
        // watch each watch variable
        this.watchVariable("this", context);
        if (watchVariables) {
            for (var i in watchVariables) {                
                this.watchVariable(i, watchVariables[i]);
            }
        }
}