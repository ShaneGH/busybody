// name is subject to change

Class("obsjs.observeTypes.computed", function () {
    
    var WITH = /\s*with\s*\(/g;
    var GET_ARGUMENT_NAMES = /([^\s,]+)/g;
    var STRIP_INLINE_COMMENTS = /\/\/.*$/mg;  
    var STRIP_BLOCK_COMMENTS = /\/\*[\s\S]*?\*\//mg;
    var GET_ITEMS = "((\\s*\\.\\s*([\\w\\$]*))|(\\[\\s*\\d\\s*\\]))+"; // ".propertyName" -or- "[2]"
    
    // monitor a function and change the value of a "watched" when it changes
    var computed = obsjs.observable.extend(function computed(callback, context, watchVariables, callbackStringOverride, allowWith) {
        
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
    });
        
    computed.prototype.execute = function() {
        this.val = this.callbackFunction.apply(this.context, this.arguments);
    };
    
    //TODO: this should be in utils
    computed.createBindFunction = function (bindToObject, bindToProperty, parser) {
        var arrayDisposeCallback;
        var output = function (oldValue, newValue) {
            
            if (parser) newValue = parser(newValue);
            
            var existingVal = obsjs.utils.obj.getObject(bindToProperty, bindToObject);
            if (newValue === existingVal)
                return;
            
            output.dispose();

            if (!computed.isArray(newValue) || !computed.isArray(existingVal)) {
                obsjs.utils.obj.setObject(bindToProperty, bindToObject, newValue);
            } else if (newValue instanceof obsjs.array) {                                        
                arrayDisposeCallback = newValue.bind(existingVal);
            } else {
                obsjs.array.copyAll(newValue, bindToObject[bindToProperty]);
            }
        };
        
        output.dispose = function () {
            if (arrayDisposeCallback) {
                arrayDisposeCallback.dispose();
                arrayDisposeCallback = null;
            }
        };
        
        return output;
    };
    
    computed.prototype.bind = function (object, property) {
        var arrayDisposeCallback;
        
        var callback = computed.createBindFunction(object, property);
        var obs = this.observe("val", callback);
        callback(null, this.val);
        
        var output = new obsjs.disposable();        
        output.registerDisposable(obs);
        output.registerDisposable(callback);
        
        return output;
    };
    
    computed.prototype.onValueChanged = function (callback, executeImmediately) {
        
        if (executeImmediately)
            callback(undefined, this.val);
            
        return this.observe("val", callback);
    };
        
    computed.stripFunction = function(input) { //TODO: unit test independantly
        input = input
            .toString()
            .replace(STRIP_INLINE_COMMENTS, "")
            .replace(STRIP_BLOCK_COMMENTS, "");
        
        var regex = /["']/g;
        
        // leading "
        while (regex.exec(input)) {
            
            var r = input[regex.lastIndex - 1] === "'" ? /'/g : /"/g;
            r.lastIndex = regex.lastIndex;
            
            // trailing "
            while (r.exec(input)) {
                
                var backslashes = 0;
                for (var i = r.lastIndex - 2; input[i] === "\\"; i--)
                    backslashes++;

                if (backslashes % 2 === 0) {
                    input = input.substr(0, regex.lastIndex - 1) + "#" + input.substr(r.lastIndex);
                    break;
                }
            }
        }
        
        return input;
    };
    
    computed.prototype.watchVariable = function(variableName, variable) {
                
        var match, 
            found = [], 
            regex = new RegExp(variableName + GET_ITEMS, "g");
        
        // find all instances of the variableName
        var tmp1 = [], tmp2;
        while ((match = regex.exec(this.callbackString)) !== null) {
            if (tmp1.indexOf(tmp2 = trim(match[0])) === -1) {
                tmp1.push(tmp2);
                found.push({
                    value: match[0],
                    index: regex.lastIndex - match[0].length
                });
            }
        }

        enumerateArr(found, function (item) {
            
            if (item.index > 0) {
                // determine whether the instance is part of a bigger variable name
                // do not need to check trailing char as this is filtered by the regex
                if (this.callbackString[item.index - 1].search(/[\w\$]/) !== -1)  //TODO test (another char before and after)
                    return;

                // determine whether the instance is a property rather than a variable
                for (var j = item.index - 1; j >= 0; j--) { // TODO: test
                    if (this.callbackString[j] === ".")
                        return;
                    else if (this.callbackString[j].search(/\s/) !== 0)
                        break;
                }
            }
            
            tmp1 = obsjs.utils.obj.splitPropertyName(item.value);
            var path = new obsjs.observeTypes.pathObserver(
                    variable, 
                    obsjs.utils.obj.joinPropertyName(tmp1.slice(1)),
                    this.throttleExecution, this);
            
            this.registerDisposable(path);
            
            var dispose;
            var te = this.throttleExecution.bind(this);
            path.onValueChanged(function(oldVal, newVal) {
                if (dispose) {
                    dispose.dispose();
                    dispose = null;
                }

                if (newVal instanceof obsjs.array)
                    dispose = newVal.observe(te);
            }, true);
        }, this);
    };
    
    computed.prototype.throttleExecution = function() {
        if (this.__executePending)
            return;
        
        this.__executePending = true;
        setTimeout((function () {
            this.__executePending = false;
            this.execute();
        }).bind(this));
    };
    
    //TODO: document and expose better
    var nonArrayTypes = [];
    computed.isArray = function (array) {
        if (array instanceof Array) {            
            for (var i = 0, ii = nonArrayTypes.length; i < ii; i++)
                if (array instanceof nonArrayTypes[i])
                    return false;
            
            return true;
        }
        
        return false;
    };
    
    computed.nonArrayType = function (type) {
        if (!(type instanceof Function)) throw "The type argument must be a function or constructor";
        
        if (nonArrayTypes.indexOf(type) === -1) nonArrayTypes.push(type);
    };
    
    return computed;
});