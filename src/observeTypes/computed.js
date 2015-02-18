// name is subject to change

Class("obsjs.observeTypes.computed", function () {
    
    var WITH = /\s*with\s*\(/g;
    var GET_ARGUMENT_NAMES = /([^\s,]+)/g;
    var STRIP_INLINE_COMMENTS = /\/\/.*$/mg;  
    var STRIP_BLOCK_COMMENTS = /\/\*[\s\S]*?\*\//mg;
    var GET_ITEMS = "((\\s*\\.\\s*([\\w\\$]*))|(\\[\\s*\\d\\s*\\]))+"; // ".propertyName" -or- "[2]"
    
    // monitor a function and change the value of a "watched" when it changes
    var computed = obsjs.disposable.extend(function computed(callback, context, options) {
        
        this._super();
        
        options = options || {};
        this.arguments = [];
        
		this.bound = [];
        this.callbackString = computed.stripFunction(callback);
        this.callbackFunction = callback;
        this.context = context;
        
        if (!options.allowWith && computed.testForWith(this.callbackString))
                throw "You cannot use the \"with\" keyword in computed functions by default. To allow \"with\", use the allowWith flag on the options argument of the constructor, however, properties of the variable within the \"with\" statement cannot be monitored for change.";
                
        // get all argument names
        var args = this.callbackString.slice(
            this.callbackString.indexOf('(') + 1, this.callbackString.indexOf(')')).match(GET_ARGUMENT_NAMES) || [], completeArg = {};
        
        // get all watch variables which are also arguments
        if (options.watchVariables && args.length) {            
            var tmp;
            for (var i in options.watchVariables) {
                // if variable is an argument, add it to args
                if ((tmp = args.indexOf(i)) !== -1) {
                    this.arguments[tmp] = options.watchVariables[i];
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
        if (options.watchVariables) {
            for (var i in options.watchVariables) {                
                this.watchVariable(i, options.watchVariables[i]);
            }
        }
    });
    
    computed.testForWith = function (input) {
        WITH.lastIndex = 0;
        
        while (WITH.exec(input)) {
            
            if (!/[\.\w\$]/.test(input[WITH.lastIndex - 1]))
                return true;
        }
        
        return false;
    };
        
    computed.prototype.execute = function() {
		var oldVal = this.val;
		this.val = this.callbackFunction.apply(this.context, this.arguments);
		
		if (this.val !== oldVal)
			enumerateArr(this.bound, function (cb) {
				cb(oldVal, this.val);
			}, this);
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

			if (computed.isArray(existingVal) && newValue == null) {
				existingVal.length = 0;	//TODO: test this case
			} else if (!computed.isArray(newValue) || !computed.isArray(existingVal)) {
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
		
        var callback = computed.createBindFunction(object, property);
		var output = this.onValueChanged(callback, true);
        output.registerDisposable(callback);
		
        return output;
    };
    
    computed.prototype.onValueChanged = function (callback, executeImmediately) {
              
		this.bound.push(callback);
        
        var output = new obsjs.disposable((function () {
			if (!callback) return;			
			this.bound.splice(this.bound.indexOf(callback), 1);
			callback = null;
		}).bind(this));
        this.registerDisposable(output);
		
        if (executeImmediately)
            callback(undefined, this.val);
		
        return output;
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
                
		if (!/^\s*[\$\w]+\s*$/.test(variableName))
			throw "Invalid variable name. Variable names can only contain 0-9, a-z, A-Z, _ and $";
		
        var match, 
            found = [], 
            regex = new RegExp(variableName.replace("$", "\\$") + GET_ITEMS, "g");
        
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
    
    computed.prototype.dispose = function () {
		this._super();
		
		this.bound.length = 0;
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