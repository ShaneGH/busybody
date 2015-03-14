// name is subject to change

Class("obsjs.observeTypes.computed", function () {
    
    var WITH = /\s*with\s*\(/g;
    var GET_ARGUMENT_NAMES = /([^\s,]+)/g;
    var STRIP_INLINE_COMMENTS = /\/\/.*$/mg;  
    var STRIP_BLOCK_COMMENTS = /\/\*[\s\S]*?\*\//mg;
    var GET_ITEMS = "((\\s*\\.\\s*([\\w\\$]*))|(\\s*\\[\\s*\\d\\s*\\]))+"; // ".propertyName" -or- "[2]"
    
    // monitor a function and change the value of a "watched" when it changes
    var computed = obsjs.observeTypes.observeTypesBase.extend(function computed(callback, context, options) {
        
        this._super();
        
        options = options || {};
        this.arguments = []; 
		if (options.observeArrayElements)
			this.possibleArrays = [];
        
		this.callbacks = [];
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
        
        // watch each watch variable
        this.watchVariable("this", context, options.observeArrayElements);
        if (options.watchVariables) {
            for (var i in options.watchVariables) {                
                this.watchVariable(i, options.watchVariables[i], options.observeArrayElements);
            }
        }
        
        this.execute();
    });
    
    computed.testForWith = function (input) {
        WITH.lastIndex = 0;
        
        while (WITH.exec(input)) {
            
            if (!/[\.\w\$]/.test(input[WITH.lastIndex - 1]))
                return true;
        }
        
        return false;
    };
        
    computed.prototype.rebuildArrays = function() {
		
		enumerateArr(this.possibleArrays, function (possibleArray) {
			if (possibleArray.disposeKeys && possibleArray.disposeKeys.length) {
				this.disposeOf(possibleArray.disposeKeys);
				possibleArray.disposeKeys.length = 0;
			}	
			
			var array = obsjs.utils.obj.getObject(possibleArray.path, possibleArray.root);
			if (array instanceof Array) {
				possibleArray.disposeKeys = possibleArray.disposeKeys || [];
				enumerateArr(array, function (item) {
					enumerateArr(possibleArray.subPaths, function (subPath) {
						possibleArray.disposeKeys.push(this.addPathWatchFor(item, subPath));
					}, this);
				}, this);
			}
		}, this);
	};
        
    computed.prototype.getValue = function() {
		if (this.possibleArrays)
			this.rebuildArrays();
		
		return this.callbackFunction.apply(this.context, this.arguments);
    };
    
    computed.prototype.bind = function (object, property) {
		
        var callback = obsjs.utils.obj.createBindFunction(object, property);
		var output = this.onValueChanged(callback, true);
        output.registerDisposable(callback);
		
        return output;
    };
    
    computed.prototype.onValueChanged = function (callback, executeImmediately) {
              
		var output = this.addCallback(callback);		
        if (executeImmediately)
            callback(undefined, this.val);
		
        return output;
    };
        
	//TODO: somehow retain "this.prop['val']"
    computed.stripFunction = function(input) {
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
    
    computed.prototype.examineVariable = function(variableName) {
		variableName = trim(variableName);
		if (!/^[\$\w]+$/.test(variableName))
			throw "Invalid variable name. Variable names can only contain 0-9, a-z, A-Z, _ and $";
		
        var match, 
            found = [], 
            regex = new RegExp(variableName.replace("$", "\\$") + GET_ITEMS, "g");
        
        // find all instances of the variableName
        var foundVariables = [], foundVariable, index;
        while ((match = regex.exec(this.callbackString)) !== null) {
            if (foundVariables.indexOf(foundVariable = match[0].replace(/\s/g, "")) === -1) {
                foundVariables.push(foundVariable);
				index = regex.lastIndex - match[0].length;
				
				if (index > 0) {
					// determine whether the instance is part of a bigger variable name
					// do not need to check trailing char as this is filtered by the regex
					if (this.callbackString[index - 1].search(/[\w\$]/) !== -1)  //TODO test (another char before and after)
						continue;

					// determine whether the instance is a property rather than a variable
					for (var j = index - 1; j >= 0; j--) { // TODO: test
						if (this.callbackString[j] === ".") {
							foundVariable = null;
							break;
						} else if (this.callbackString[j].search(/\s/) !== 0) {
							break;
						}
					}
				}
				
				if (foundVariable !== null)
                	found.push(foundVariable);
            }
        }
		
		return found;
	};
    
    computed.prototype.watchVariable = function(variableName, variable, observeArrayElements) {
		
		var found = this.examineVariable(variableName), tmp1;

        enumerateArr(found, function (item) {
            
            tmp1 = obsjs.utils.obj.splitPropertyName(item);
			this.addPathWatchFor(variable, obsjs.utils.obj.joinPropertyName(tmp1.slice(1)));
			
			var arrProps;
			if (observeArrayElements && (arrProps = this.examineArrayProperties(item)) && arrProps.length) {
				this.possibleArrays.push({
					root: variable,
					path: obsjs.utils.obj.joinPropertyName(tmp1.slice(1)),
					subPaths: arrProps
				});
			}
        }, this);
    };
	
    computed.prototype.addPathWatchFor = function(variable, path) {
		var path = new obsjs.observeTypes.pathObserver(variable, path, this.throttleExecution, this);
		
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
		
		return this.registerDisposable(path);
	};
	
	computed.prototype.examineArrayProperties = function (pathName) {
		
		pathName = pathName.replace(/\$/g, "\\$")
							.replace(/\./g, "\\.")
							.replace(/\[/g, "\\[")
							.replace(/\]/g, "\\]") + 
							 "\\s*\\[\\s*[\\w\\$]+\\s*\\]\\s*"; // pathName[variable]
		
		var regex1 = new RegExp(pathName + GET_ITEMS, "g");
		var regex2 = new RegExp("^" + pathName);
		
		var found, output = [];
        while (found = regex1.exec(this.callbackFunction)) {
            found = found[0].substring(regex2.exec(found[0])[0].length);
			
			output.push(found[0] === "." ? found.substring(1) : found);
        }
		
		return output;
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