//TODO: look into esprima and falafel

Class("busybody.observeTypes.computed", function () {
    
    var WITH = /\s*with\s*\(/g;
    var GET_ARGUMENT_NAMES = /([^\s,]+)/g;
    var STRIP_INLINE_COMMENTS = /\/\/.*$/mg;  
    var STRIP_BLOCK_COMMENTS = /\/\*[\s\S]*?\*\//mg;
    var GET_ITEMS = "((\\s*\\.\\s*([\\w\\$]*))|(\\s*\\[\\s*\\d\\s*\\]))+"; // ".propertyName" -or- "[2]"
    var completeArg = {};
	
    var computed = busybody.observeTypes.observeTypesBase.extend(function computed(callback, context, options) {
		///<summary>A value defined by the return value of a function. If configured correctly, a change in a value within the function will trigger a re-execution of the function<summary>
		///<param name="callback" type="Function">The logic which returns the computed value<param>
		///<param name="context" type="Any">The "this" value in the callback<param>
		///<param name="options" type="Object" optional="true">Options on how the computed is composed<param>
		///<param name="options.watchVariables" type="Object">Default: null. A dictionary of variables in the callback which are to be watched<param>
		///<param name="options.observeArrayElements" type="Boolean">Default: false. If set to true, the computed will attempt to watch values within any array watch variables. This is useful if the computed is an aggregate function. The default is false because it is expensive computationally<param>
		///<param name="options.allowWith" type="Boolean">Default: false. If set to true, "with (...)" statements are allowed in the computed function. Although variables accessed within the with statement cannot be observed<param>delayExecution
		///<param name="options.delayExecution" type="Boolean">Default: false. If set to true, the computed will not be activated until it's execute function is called or a value within the computed changes<param>
        
        this._super();
        
        options = options || {};
		
		///<summary type="[Any]">A list of arguments to be applied to the callback function<summary>
        this.arguments = []; 
		if (options.observeArrayElements)
			this.possibleArrays = [];
        
		///<summary type="[Function]">A list of callbacks which will be called when the computed value changes<summary>
		this.callbacks = [];
		
		///<summary type="String">The computed logic as a string with comments and strings removed<summary>
        this.callbackString = computed.stripFunction(callback);
		
		///<summary type="Function">The computed logic<summary>
        this.callbackFunction = callback;
		
		///<summary type="Any">The "this" in the computed logic<summary>
        this.context = context;
        
        if (!options.allowWith && computed.testForWith(this.callbackString))
                throw "You cannot use the \"with\" keyword in computed functions by default. To allow \"with\", use the allowWith flag on the options argument of the constructor, however, properties of the variable within the \"with\" statement cannot be monitored for change.";
                
        // get all argument names
        var args = this.callbackString.slice(
            this.callbackString.indexOf('(') + 1, this.callbackString.indexOf(')')).match(GET_ARGUMENT_NAMES) || [];
        
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
        
		if (!options.delayExecution)
        	this.execute();
    });
    
    computed.testForWith = function (input) {
		///<summary>Determine if a function string contains a "with (...)" call<summary>
		///<param name="input" type="String">The input<param>
		///<returns type="Boolean">The result<param>
		
        WITH.lastIndex = 0;
        
        while (WITH.exec(input)) {
            
            if (!/[\.\w\$]/.test(input[WITH.lastIndex - 1]))
                return true;
        }
        
        return false;
    };
        
    computed.prototype.rebuildArrays = function() {
		///<summary>Re-subscribe to all possible arrays</summary>
		
		enumerateArr(this.possibleArrays, function (possibleArray) {
			if (possibleArray.disposeKeys && possibleArray.disposeKeys.length) {
				this.disposeOf(possibleArray.disposeKeys);
				possibleArray.disposeKeys.length = 0;
			}	
			
			var array = possibleArray.path.length ? 
				busybody.utils.obj.getObject(possibleArray.path, possibleArray.root) : 
				possibleArray.root;
			
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
        
	// abstract
    computed.prototype.getValue = function() {
		///<summary>Execute the computed function<summary>
		///<returns type="Any">The result<param>
		
		if (this.possibleArrays)
			this.rebuildArrays();
		
		return this.callbackFunction.apply(this.context, this.arguments);
    };
    
    computed.prototype.bind = function (object, property) {
		///<summary>Bind the value of this computed to the property of an object<summary>
		///<param name="object" type="Object">The object<param>
		///<param name="property" type="String">The property<param>
		///<returns type="busybody.disposable">A dispose object<param>
		
        var callback = computed.createBindFunction(object, property);
		var output = this.onValueChanged(callback, true);
        output.registerDisposable(callback);
		
        return output;
    };
    
    computed.prototype.onValueChanged = function (callback, executeImmediately) {
		///<summary>Execute a callback when the value of the computed changes<summary>
		///<param name="callback" type="Function">The callback: function (oldValue, newValue) { }<param>
		///<param name="executeImmediately" type="Boolean">If set to true the callback will be executed immediately with undefined as the oldValue<param>
		///<returns type="busybody.disposable">A dispose object to remove the callback<param>
              
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
    
    computed.prototype.examineVariable = function(variableName, complexExamination) {
		///<summary>Find all property paths of a given variable<summary>
		///<param name="variableName" type="String">The variable name<param>
		///<param name="complexExamination" type="Boolean">If set to true, the result will include the indexes of the property path as well as the actual text of the property paths<param>
		///<returns type="[Object]">The results<param>
		
		variableName = trim(variableName);
		if (!/^[\$\w]+$/.test(variableName))
			throw "Invalid variable name. Variable names can only contain 0-9, a-z, A-Z, _ and $";
		
        var match, 
            output = [], 
			r = variableName.replace("$", "\\$"),
            regex = new RegExp((complexExamination ? "(" : "") + r + GET_ITEMS + (complexExamination ? ")|" + r : ""), "g"),
			foundVariables = [], 
			foundVariable, 
			index,
			i;
        
        // find all instances of the variableName
        while ((match = regex.exec(this.callbackString)) !== null) {
			index = regex.lastIndex - match[0].length;
			
			// if the variable has been found before and we do not need to find each instance
			if ((i = foundVariables.indexOf(foundVariable = match[0].replace(/\s/g, ""))) !== -1 && !complexExamination)
				continue;

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
			
			if (foundVariable === null) 
				continue;
			
			// if this is the first time the var has been found
			if (i === -1) {
				foundVariables.push(foundVariable);
				i = output.length;
				output.push({
					variableName: foundVariable,
					complexResults: []
				});
			}
				
			// if we need to record the exact instance
			if (complexExamination) {
				output[i].complexResults.push({
					name: match[0],
					index: index
				});
			}
        }
		
		return output;
	};
    
    computed.prototype.watchVariable = function(variableName, variable, observeArrayElements) {
		///<summary>Create subscriptions to all of the property paths to a specific variable<summary>
		///<param name="variableName" type="String">The variable name<param>
		///<param name="variable" type="Any">The instance of the variable<param>
		///<param name="observeArrayElements" type="Boolean">If set to true, each find will also be treated as a possible array and subscribed to. This is a more expensive process computationally<param>
		
		// find all instances
		var found = this.examineVariable(variableName, observeArrayElements), tmp;

		var arrProps;
        enumerateArr(found, function (item) {
            
			// if there is a path, i.e. variable.property, subscribe to it
            tmp = busybody.utils.obj.splitPropertyName(item.variableName);
			if (tmp.length > 1)
				this.addPathWatchFor(variable, busybody.utils.obj.joinPropertyName(tmp.slice(1)));
			
			// if we are looking for array elements, do more examination for this
			if (observeArrayElements) {
				var possibleArray;
				enumerateArr(item.complexResults, function (found) {
					if (arrProps = this.examineArrayProperties(found.name, found.index)) {
						if (!possibleArray)
							this.possibleArrays.push(possibleArray = {
								root: variable,
								path: busybody.utils.obj.joinPropertyName(tmp.slice(1)),
								subPaths: [arrProps]
							});
						else
							possibleArray.subPaths.push(arrProps);
					}
				}, this);
			}
        }, this);
    };
	
	var getArrayItems = new RegExp("^\\s*\\[\\s*[\\w\\$]+\\s*\\]\\s*" + GET_ITEMS);
	computed.prototype.examineArrayProperties = function (pathName, index) {
		///<summary>Discover whether a property path may be an indexed array<summary>
		///<param name="pathName" type="String">The property path<param>
		///<param name="index" type="Number">The location of the property path<param>
		///<returns type="String">The second half of the possible indexed array property, if any<returns>
		
		var found;
		if (found = getArrayItems.exec(this.callbackString.substr(index + pathName.length))) {
			found = found[0].substr(found[0].indexOf("]") + 1).replace(/\s/g, "");
			return (found[0] === "." ? found.substring(1) : found);
		}
	};
	
    computed.prototype.addPathWatchFor = function(variable, path) {
		///<summary>Add a path watch object, triggering an execute(...) when something chages<summary>
		///<param name="variable" type="Object">The path root<param>
		///<param name="path" type="String">The path<param>
		///<returns type="String">A disposable key. The path can be disposed by calling this.disposeOf(key)<param>
		
		var path = new busybody.observeTypes.pathObserver(variable, path, this.execute, this);
		
		var dispose;
		var te = this.execute.bind(this);
		path.onValueChanged(function(oldVal, newVal) {
			if (dispose) {
				dispose.dispose();
				dispose = null;
			}

			if (newVal instanceof busybody.array)
				dispose = newVal.observe(te);
		}, true);
		
		return this.registerDisposable(path);
	};
	
	computed.createBindFunction = function (bindToObject, bindToProperty) {
		///<summary>Create a functino which will bind the result of the computed to either an object property or an array<summary>
		///<param name="bindToObject" type="Object">The object root<param>
		///<param name="bindToProperty" type="String">The path<param>
		///<returns type="Function">The bind function (function (oldValue, newValue) { }). The function has a dispose property which needs to be called to disposse of any array subscriptions<param>
		
        var arrayDisposeCallback;
        var output = function (oldValue, newValue) {
			
            var existingVal = busybody.utils.obj.getObject(bindToProperty, bindToObject);
            if (newValue === existingVal)
                return;
			
            output.dispose();
			
			if (newValue instanceof Array || existingVal instanceof Array)
				arrayDisposeCallback = busybody.tryBindArrays(newValue, existingVal);
            else
				busybody.utils.obj.setObject(bindToProperty, bindToObject, newValue);
        };
        
        output.dispose = function () {
            if (arrayDisposeCallback) {
                arrayDisposeCallback.dispose();
                arrayDisposeCallback = null;
            }
        };
        
        return output;
    };
    
    return computed;
});