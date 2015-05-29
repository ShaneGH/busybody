// busybody v0.2.1
// (c) Shane Connon 2015
// http://www.opensource.org/licenses/mit-license.php
(function () {

// orienteer v0.1.0
// (c) Shane Connon 2015
// http://www.opensource.org/licenses/mit-license.php
(function () {

function orienteer() {
	///<summary>The object class is the base class for all objects. It has base functionality for inheritance and parent methods</summary>
};

var cachedSuperMethods = {
	parents:[],
	children:[]
};

orienteer.clearVirtualCache = function(forMethod /*optional*/) {
	///<summary>Lookup results for _super methods are cached. This could cause problems in the rare cases when a class prototype is altered after one of its methods are called. Clearing the cache will solve this</summary>
	///<param name="forMethod" type="Function" optional="true">A method to clear from the cache</param>
	
	if(!forMethod) {
		cachedSuperMethods.parents.length = 0;
		cachedSuperMethods.children.length = 0;
		return;
	}
	
	for(var i = 0, ii = cachedSuperMethods.children.length; i < ii; i++) {
		if(cachedSuperMethods.children[i] === forMethod || cachedSuperMethods.parents[i] === forMethod) {
			cachedSuperMethods.children.splice(i, 1);
			cachedSuperMethods.parents.splice(i, 1);
		}
	}
};

// The virtual cache caches overridden methods for quick lookup later. It is not safe to use if two function prototypes which are not related share the same function, or function prototypes are modified after an application initilisation stage
orienteer.useVirtualCache = true;

orienteer.prototype._super = function() {        
	///<summary>Call the current method or constructor of the parent class with arguments</summary>
	///<returns type="Any">Whatever the overridden method returns</returns>
	
	var currentFunction = arguments.callee.caller;
	
	// try to find a cached version to skip lookup of parent class method
	var cached = null;
	if(orienteer.useVirtualCache) {
		var superIndex = cachedSuperMethods.children.indexOf(currentFunction);
		if(superIndex !== -1)
			cached = cachedSuperMethods.parents[superIndex];
	}
	
	if(!cached) {
		
		// compile prototype tree into array
		var inheritanceTree = [];
		var current = this.constructor.prototype;
		while(current) {
			inheritanceTree.push(current);
			current = Object.getPrototypeOf(current);
		}
		
		// reverse array so that parent classes come before child classes
		inheritanceTree.reverse();            
		
		// find the first instance of the current method in inheritance tree
		for(var i = 0, ii = inheritanceTree.length; i < ii; i++) {
			// if it is a constructor
			if(inheritanceTree[i] === currentFunction.prototype) {
				cached = inheritanceTree[i - 1].constructor;							
			} else {
				for(var method in inheritanceTree[i]) {
					if(inheritanceTree[i][method] === currentFunction) {
						for(var j = i - 1; j >= 0; j--) {
							if(inheritanceTree[j][method] !== currentFunction) {
								cached = inheritanceTree[j][method];
								break;
							}
						}
					}
					
					if(cached)
						break;
				}
			}
				
			if (cached) {
				if(orienteer.useVirtualCache) {
					// map the current method to the method it overrides
					cachedSuperMethods.children.push(currentFunction);
					cachedSuperMethods.parents.push(cached);
				}

				break;
			}
		}
		
		if(!cached)
			throw "Could not find method in parent class";
	}
			
	// execute parent class method
	return cached.apply(this, arguments);
};

var validFunctionCharacters = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
orienteer.extend = function (childClass) {
	///<summary>Use prototype inheritance to inherit from this class. Supports "instanceof" checks</summary>
	///<param name="childClass" type="Function" optional="false">The constructor of a class to create. Name the constructor function to get better debugger information</param>
	///<returns type="Function">The newly created class</returns>
	
	// if the input is a lonely constructor, convert it into the object format
	if(childClass.constructor === Function) {
		var cc = childClass;
		childClass = {
			constructor: cc,
			statics: {}
		};
		
		for(var item in childClass.constructor)
			childClass.statics[i] = childClass.constructor[i];
		
		for(var item in childClass.constructor.prototype)
			childClass[i] = childClass.constructor.prototype[i];
		
	} else if (childClass.constructor === Object) {
		// in case the consumer forgot to specify a constructor, default to parent constructor
		childClass.constructor = function() {
			this._super.apply(this, arguments);
		};
	} else if(!childClass.constructor || childClass.constructor.constructor !== Function) {
		throw "the property \"constructor\" must be a function";
	}
	
	// static functions
	for (var p in this)
		if (this.hasOwnProperty(p) && this[p] && this[p].constructor === Function && this[p] !== orienteer.clearVirtualCache && this[p] !== orienteer.getInheritanceChain && childClass.constructor[p] === undefined)
			childClass.constructor[p] = this[p];
	 
	var prototypeTracker = function() { this.constructor = childClass.constructor; }     
	prototypeTracker.prototype = this.prototype;
	childClass.constructor.prototype = new prototypeTracker();
	
	for(var i in childClass) {
		if(i === "constructor") continue;
		if(i === "statics") {
			for(var j in childClass[i])
				childClass.constructor[j] = childClass[i][j];
			
			continue;
		}
		
		childClass.constructor.prototype[i] = childClass[i];
	}
	
	
	return childClass.constructor;
};

orienteer.getInheritanceChain = function(forClass) {
	var chain = [];
		
	while (forClass) {            
		chain.push(forClass);
		forClass = Object.getPrototypeOf(forClass.prototype);
		if(forClass)
			forClass = forClass.constructor
	}
	
	return chain;
};


    window.orienteer = orienteer;
}());

(function (orienteer) {
    var busybody = {};
    var useObjectObserve = busybody.useObjectObserve = Object.observe && (!window.hasOwnProperty("useObjectObserve") || window.useObjectObserve);

    
var enumerateArr = function(enumerate, action, context) {
    ///<summary>Enumerate through an array or object</summary>
    ///<param name="enumerate" type="Any">An item to enumerate over</param>
    ///<param name="action" type="Function">The callback to apply to each item</param>
    ///<param name="context" type="Any" optional="true">The context to apply to the callback</param>
    
    if (!enumerate) return;
    
    context = context || window;
    
    for(var i = 0, ii = enumerate.length; i < ii; i++)
        action.call(context, enumerate[i], i);
};
    
var enumerateObj = function(enumerate, action, context) {
    ///<summary>Enumerate through an array or object</summary>
    ///<param name="enumerate" type="Any">An item to enumerate over</param>
    ///<param name="action" type="Function">The callback to apply to each item</param>
    ///<param name="context" type="Any" optional="true">The context to apply to the callback</param>
    
    if (!enumerate) return;
    
    context = context || window;
        
    if(enumerate == null) return;

    for(var i in enumerate)
        action.call(context, enumerate[i], i);
};

var Class = function(classFullName, accessorFunction) {
    ///<summary>Create an busybody class</summary>
    ///<param name="classFullName" type="String">The name of the class</param>
    ///<param name="accessorFunction" type="Function">A function which returns the class</param>
    
    classFullName = classFullName.split(".");
    var namespace = classFullName.splice(0, classFullName.length - 1);
    
    var tmp = {};
    tmp[classFullName[classFullName.length - 1]] = accessorFunction();
    
    Extend(namespace.join("."), tmp);
    
    return tmp[classFullName[classFullName.length - 1]];
};

var Extend = function(namespace, extendWith) {
    ///<summary>Similar to $.extend but with a namespace string which must begin with "busybody"</summary>
    ///<param name="namespace" type="String">The namespace to add to</param>
    ///<param name="extendWith" type="Object">The object to add to the namespace</param>
    
    namespace = namespace.split(".");
    
    if(namespace[0] !== "busybody") throw "Root must be \"busybody\".";
    namespace.splice(0, 1);
    
    var current = busybody;
    enumerateArr(namespace, function(nsPart) {
        current = current[nsPart] || (current[nsPart] = {});
    });
    
    if(extendWith && extendWith instanceof Function) extendWith = extendWith();
    enumerateObj(extendWith, function(item, i) {
        current[i] = item;
    });
};
    
var _trimString = /^\s+|\s+$/g;
var trim = function(string) {
    ///<summary>Trims a string</summary>
    ///<param name="string" type="String">The string to trim</param>
    ///<returns type="String">The trimmed string</returns>
    
    return string ? string.replace(_trimString, '') : string;
};

Class("busybody.utils.obj", function () {
        
    var arrayMatch = /\[\s*\d\s*\]$/g;
    var splitPropertyName = function(propertyName) {
		///<summary>Split a path into strings and numbers</summary>
		///<param name="propertyName" type="String">The name</param>
		///<returns type="[String|Number]">The path</returns>
		
        propertyName = propertyName.split(".");
        
        var tmp;
        for (var i = 0; i < propertyName.length; i++) {
            propertyName[i] = busybody.utils.obj.trim(propertyName[i]);
            var match = propertyName[i].match(arrayMatch);
            if (match && match.length) {
                if (tmp = busybody.utils.obj.trim(propertyName[i].replace(arrayMatch, ""))) {
                    propertyName[i] = busybody.utils.obj.trim(propertyName[i].replace(arrayMatch, ""));
                } else {
                    propertyName.splice(i, 1);
                    i--;
                }
                
                for (var j = 0, jj = match.length; j < jj; j++)
                    propertyName.splice(++i, 0, parseInt(match[j].match(/\d/)[0]));
            }
        }
        
        return propertyName;
    };
    
    var joinPropertyName = function (propertyName) {
		///<summary>Join a path</summary>
		///<param name="propertyName" type="[String|Number]">The path</param>
		///<returns type="String">The name</returns>
		
        var output = [];
        enumerateArr(propertyName, function (item) {
            if (!isNaN(item))
                output.push("[" + item + "]");
            else if (output.length === 0)
                output.push(item);
            else
                output.push("." + item);
        });
        
        return output.join("");
    }
    
    var getObject = function(propertyName, context) {
        ///<summary>Get an object from string</summary>
        ///<param name="propertyName" type="String">A pointer to the object to get</param>
        ///<param name="context" type="Any" optional="true">The root context. Defaults to window</param>
        ///<returns type="Any">The object</returns>
        
        return _getObject(splitPropertyName(propertyName), context);
    };
    
    var getPartialObject = function(propertyName, context, index) {
        ///<summary>Get an object from part of a string</summary>
        ///<param name="propertyName" type="String">A pointer to the object to get</param>
        ///<param name="context" type="Any" optional="true">The root context. Defaults to window</param>
        ///<param name="index" type="Number" optional="true">Decide how many parts to evaluate. A value of 0 indicates evaluate all, a value less than 0 indicates that you do not evaluate the last elements, a value greater than 0 indicates that you only evaluate the first elements</param>
        ///<returns type="Any">The object</returns>
		
		var output = {};
		
		propertyName = splitPropertyName(propertyName);
		if (index <= 0)
			output.remainder = propertyName.splice(propertyName.length + index, index * -1);
		else
			output.remainder = propertyName.splice(index, propertyName.length - index);
		
		output.object = _getObject(propertyName, context, index);
		return output;
    };
    
    function _getObject(splitPropertyName, context) {
		
        if(!context) context = window;
        
        for (var i = 0, ii = splitPropertyName.length; i <ii; i++) {
            context = context[splitPropertyName[i]];
            if(context == null)
                return i === ii - 1 ? context : null;
        }
        
        return context;
    };
    
    var setObject = function(propertyName, context, value) {
		///<summary>Set an object path, if possible</summary>
		///<param name="propertyName" type="String">The property</param>
		///<param name="context" type="Object">The object</param>
		///<param name="value" type="Any">The value</param>
		
        propertyName = splitPropertyName(propertyName);
        if (propertyName.length > 1)
            context = _getObject(propertyName.splice(0, propertyName.length -1), context);
        
		if (context)
        	context[propertyName[0]] = value;
    };	

    function addWithDispose(callbackArray, item) {
		///<summary>Add an item to an array and return a disposable which will remove it</summary>
		///<param name="callbackArray" type="Array">The array</param>
		///<param name="item" type="Any">The item</param>
		///<returns type="busybody.disposable">The disposable</returns>

        callbackArray.push(item);
        var dispose = new busybody.disposable(function () {
            if (!dispose) return;
            dispose = null;

            item = callbackArray.indexOf(item);
            if (item !== -1)
                callbackArray.splice(item, 1);
        });

        return dispose;
    }
        
    var obj = function obj() { };
    obj.trim = trim;
    obj.addWithDispose = addWithDispose;
    obj.enumerateArr = enumerateArr;
    obj.enumerateObj = enumerateObj;
    obj.getObject = getObject;
    obj.getPartialObject = getPartialObject;
    obj.setObject = setObject;
    obj.splitPropertyName = splitPropertyName;
    obj.joinPropertyName = joinPropertyName;
    
    return obj;
});


Class("busybody.disposable", function () {
    
	function init (disp) {
		if (!disp.$disposables) disp.$disposables = {};
	}
	
    var disposable = orienteer.extend(function disposable(disposableOrDisposeFunction) {
        ///<summary>An object which can be disposed</summary>
		///<param name="disposableOrDisposeFunction" type="Object|Function">An initial dispose function</param>
        
        this._super();
		
		///<summary type="[Function]">A list of functions to call when this is disposed of</summary>
		this.$disposables = undefined;
        
        if (!disposableOrDisposeFunction)
            ;
        else if (disposableOrDisposeFunction instanceof Function)
            this.registerDisposeCallback(disposableOrDisposeFunction);
        else
            this.registerDisposable(disposableOrDisposeFunction);
    });
    
    disposable.prototype.disposeOf = function(key) {
        ///<summary>Dispose of an item registered as a disposable</summary>
        ///<param name="key" type="String" optional="false">The key of the item to dispose</param>
		
		if (key instanceof Array) {
			var result = false;
			enumerateArr(key, function (key) {
				result |= this.disposeOf(key);
			}, this);
			
			return result;
		}
		
        if(this.$disposables && this.$disposables[key]) {
            this.$disposables[key]();
            return delete this.$disposables[key];
        }
		
		return false;
    };
    
    disposable.prototype.disposeOfAll = function() {
        ///<summary>Dispose of all items registered as a disposable</summary>
		if (this.$disposables)
			for(var i in this.$disposables)
				this.disposeOf(i);
    };
    
    disposable.prototype.registerDisposeCallback = (function() {
        var i = 0;
        return function(disposeFunction) {
            ///<summary>Register a dispose function which will be called when this object is disposed of.</summary>
            ///<param name="disposeFunction" type="Function" optional="false">The function to call when on dispose</param>
            ///<returns type="String">A key to dispose off this object manually</returns>

            if(!disposeFunction || disposeFunction.constructor !== Function) throw "The dispose function must be a Function";

			init(this);
            var id = (++i).toString();            
            this.$disposables[id] = disposeFunction;            
            return id;
        };
    })();
    
    disposable.prototype.registerDisposable = function(disposableOrDisposableGetter) {
        ///<summary>An object with a dispose function to be disposed when this object is disposed of.</summary>
        ///<param name="disposableOrDisposableGetter" type="Function" optional="false">The function to dispose of on dispose, ar a function to get this object</param>
        ///<returns type="String">A key to dispose off this object manually</returns>
        
        if(!disposableOrDisposableGetter) return;
        if(disposableOrDisposableGetter.constructor === Function && !disposableOrDisposableGetter.dispose) disposableOrDisposableGetter = disposableOrDisposableGetter.call(this);        
        if(!disposableOrDisposableGetter || !(disposableOrDisposableGetter.dispose instanceof Function)) throw "The disposable object must have a dispose(...) function";

        return this.registerDisposeCallback(disposableOrDisposableGetter.dispose.bind(disposableOrDisposableGetter));
    };
    
    disposable.prototype.dispose = function() {
        ///<summary>Dispose of this disposable</summary>
        
        this.disposeOfAll();
    };
                                      
    return disposable;
});

// name is subject to change

Class("busybody.utils.executeCallbacks", function () {
	
	var executeCallbacks = busybody.disposable.extend(function executeCallbacks() {
		///<summary>Base class for objects with an execute(...) function which executes a list of callbacks</summary>
		
		if (this.constructor === executeCallbacks) throw "You cannot create an instance of an abstract class";
		
		this._super();
		
		this.callbacks = [];
	});
	
	executeCallbacks.prototype.addCallback = function (callback) {
		///<summary>Add a callback</summary>
		///<param name="callback" type="Function">The callback</param>
		///<param name="property" type="String">The property</param>
		///<returns type="busybody.disposable">A dispose object</returns>
		
		var op = busybody.utils.obj.addWithDispose(this.callbacks, callback);
		this.registerDisposable(op);
		
		return op;
	};
        
    executeCallbacks.prototype._execute = function() {
		///<summary>Abstract. Execute and return argumets for the callbacks</summary>
		///<returns type="Object">Arguments for the callbacks in the form of { cancel: true | false, arguments: [] }</returns>
		
		throw "Abstract methods must be implemented";
	};
	
    executeCallbacks.prototype.execute = function() {
		///<summary>Execute all callbacks</summary>
		
		var args = this._execute();
		
		if (args && !args.cancel)
			enumerateArr(this.callbacks.slice(), function (cb) {
				cb.apply(null, args.arguments || []);
			});
    };
    
    executeCallbacks.prototype.dispose = function () {
		///<summary>Dispose</summary>
		
		this._super();		
		this.callbacks.length = 0;
    };
	
	return executeCallbacks;
});


Class("busybody.observeTypes.observeTypesBase", function () {
	
	var observeTypesBase = busybody.utils.executeCallbacks.extend(function observeTypesBase() {
		///<summary>Base class for computed and pathObserve</summary>
		
		if (this.constructor === observeTypesBase) throw "You cannot create an instance of an abstract class";
		
		this._super();
	});
      
    observeTypesBase.prototype.getValue = function() {
		///<summary>Get the current value of the computed or pathObserver</summary>
		
		throw "Abstract methods must be implemented";
	};
        
    observeTypesBase.prototype._execute = function() {
		///<summary>Abstract. Execute and return argumets for the callbacks</summary>
		///<returns type="Object">Arguments for the callbacks in the form of { cancel: true | false, arguments: [oldVal, newVal] }</returns>
		
		var oldVal = this.val;
		this.val = this.getValue();
		
		return {
			cancel: this.val === oldVal,
			arguments: [oldVal, this.val]
		};
    };
	
	return observeTypesBase;
});


Class("busybody.observableBase", function () {
        
    var observableBase = busybody.disposable.extend(function observableBase(forObject) {
        ///<summary>An object whose properties can be subscribed to</summary>
		///<param name="forObject" type="Object" optional="true">Observe changes to another object</param>

        this._super();

        ///<summary type="[Object]">Current changes to be processed</summary>
        this.$changeBatch = [];
		
        ///<summary type="Object">The object to observe. If null, observe this</summary>
        this.$forObject = forObject;
		
        ///<summary type="Object">Dictionary of change callbacks</summary>
        this.$callbacks = {};
        
        ///<summary type="Number">Simple count of number of times any property on this object has been subscribed to.</summary>
        this.$observes = 0;
    });
    
	// this function is also used by arrayBase
    observableBase.prototype.registerChangeBatch = function (changes) {
		///<summary>Register a batch of changes to this object</summary>
		///<param name="changes" type="[Object]">The changes</param>
		
        if (!this.$changeBatch.length)
            setTimeout(this.processChangeBatch.bind(this));
        
        this.$changeBatch.push.apply(this.$changeBatch, changes);
    };
    
    observableBase.prototype.processChangeBatch = function () {
		///<summary>Process the current batch of changes</summary>
		
        var splitChanges = {};
        enumerateArr(this.$changeBatch, function(change) {
            if (!splitChanges[change.name])
                splitChanges[change.name] = [];

            splitChanges[change.name].push(change);
        });
        
        this.$changeBatch.length = 0;

        busybody.utils.observeCycleHandler.instance.execute(this.$forObject || this, (function () {
			var evaluateMultiple = [];
			enumerateObj(splitChanges, function (changes, name) {
				if (this.$callbacks[name])
					evaluateMultiple.push.apply(evaluateMultiple, observableBase.processChanges(this.$callbacks[name], changes));
			}, this);

			enumerateArr(evaluateMultiple, function (c) { c(); });
		}).bind(this));
    };

    observableBase.processChanges = function (callbacks, changes) {
		///<summary>Process changes</summary>
		///<param name="callbacks" type="[busybody.callbacks.chageCallback]">The callbacks</param>
		///<param name="changes" type="[Object]">The changes</param>
		///<returns type="[Function]">A list of items to execute after this funciton returns</returns>
		
        var dispose = [];
        var evaluateMultiple = [];
        enumerateArr(callbacks, function (callback, i) {
            if (callback.evaluateOnEachChange) {
                for (var i = 0, ii = changes.length; i < ii; i++)
                    if (callback.evaluateSingle(changes, i))
                        dispose.push(i);
            } else {
                evaluateMultiple.push(function () {
                    if (callback.evaluateMultiple(changes))
                        dispose.push(i);
                });
            }
        });

        // reverse array so that removals before will not affect array enumeration
        dispose.sort(function (a,b) { return a < b;  })
        for (var i = 0, ii = dispose.length; i < ii; i++)
            callbacks.splice(dispose[i], 1);
        
        return evaluateMultiple;
    };
    
    observableBase.prototype.onNextPropertyChange = function (property, callback) {
		///<summary>Fire a callback once, the next property change</summary>
		///<param name="property" type="String">The property to observe</param>
		///<param name="callback" type="Function">The callback</param>
		
        throw "Abstract methods must be overridden";
    };
    
    observableBase.prototype.captureChanges = function (logic, callback, toProperty) {
		///<summary>Capture all of the changes to the property perpetrated by the logic</summary>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
		///<param name="toProperty" type="String" optional="true">The property</param>
				
		if (toProperty && (toProperty = busybody.utils.obj.splitPropertyName(toProperty)).length > 1) {
			return busybody.captureChanges(
				busybody.utils.obj.getObject(toProperty.slice(0, toProperty.length - 1).join("."), this.$forObject || this), 
				logic, 
				callback, 
				toProperty[toProperty.length - 1]);
		}
		
		toProperty = toProperty && toProperty.length ? toProperty[0] : undefined;
		var cb = toProperty ? function (changes) {
			var ch = [];
			enumerateArr(changes, function (change) {
				if (change.name == toProperty)
					ch.push(change);
			});

			callback(ch);
		} : callback.bind(this);
		
		if (toProperty)
        	this._init(toProperty);
		
		return this._captureChanges(logic, cb);
    };
    
    observableBase.prototype._captureChanges = function (logic, callback, toProperty) {
		///<summary>Capture all of the changes to the property perpetrated by the logic</summary>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
		///<param name="toProperty" type="String">The property</param>
		
        throw "Abstract methods must be overridden";
	};
    
    observableBase.prototype.bind = function (property, otherObject, otherProperty) {
		///<summary>Bind a property to another objects property</summary>
		///<param name="property" type="String">The property</param>
		///<param name="otherObject" type="Object">The other object</param>
		///<param name="otherProperty" type="String">The other property</param>
		
		return busybody.bind(this, property, otherObject, otherProperty);
    };

    observableBase.prototype.observeArray = function (property, callback, options) {
		///<summary>Observe an array property for changes</summary>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback</param>
		///<param name="options" type="Object" optional="true">See busybody.array.observe for options</param>
		///<returns type="busybody.disposable">A disposable</returns>
		
        var d2, d1 = this.observe(property, function (oldValue, newValue) {
            
            if (d2) {
                this.disposeOf(d2);
                d2 = null;
            }
            
            var change = {
                object: newValue || [],
                index: 0,
                addedCount: newValue instanceof Array ? newValue.length : 0,
                removed: oldValue instanceof Array ? oldValue : [],
                type: "splice"
            };
            
            //TODO: duplication of logic
            if (options && options.evaluateOnEachChange) {
                callback.call(options.context, change);
            } else {
                var cec = new busybody.utils.compiledArrayChange([change], 0, 1);
                callback.call(options ? options.context : null, cec.getRemoved(), cec.getAdded(), cec.getIndexes());
            }
            
            if (newValue instanceof busybody.array)
                d2 = this.registerDisposable(newValue.observe(callback, options));
        }, {context: this});
        
        var tmp;
        if ((tmp = busybody.utils.obj.getObject(property, this.$forObject || this)) instanceof busybody.array)
            d2 = this.registerDisposable(tmp.observe(callback, options));
        
        return new busybody.disposable(function () {
            if (d2) {
                this.disposeOf(d2);
                d2 = null;
            }
            
            if (d1) {
                d1.dispose();
                d1 = null;
            }
        });
    };

    observableBase.prototype.isObserved = function () {
		///<summary>Determine if any callbacks are currently monitoring this observable</summary>
		///<returns type="Boolean"></returns>
        
        return !!this.$observes;
    };
    
    observableBase.prototype.observe = function (property, callback, options) {
		///<summary>Observe changes to a property </summary>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback to execute</param>
		///<param name="options" type="Object" optional="true">Options for the callback</param>
		///<param name="options.context" type="Any" optional="true">Default: null. The "this" in the callback</param>
		///<param name="options.useRawChanges" type="Boolean">Default: false. Use the change objects from the Object.observe as arguments</param>
		///<param name="options.evaluateOnEachChange" type="Boolean">Default: false. Evaluate once for each change rather than on an amalgamation of changes</param>
		///<param name="options.evaluateIfValueHasNotChanged" type="Boolean">Default: false. Evaluate if the oldValue and the newValue are the same</param>
		///<param name="options.activateImmediately" type="Boolean">Default: false. Activate the callback now, meaning it could get changes which were applied before the callback was created</param>
		///<param name="options.trackPartialObservable" type="Boolean">Default: false. Path only. If set to true, will track observables at the end of a path, even if there are non observables before them.</param>
		///<param name="options.forceObserve" type="Boolean">Default: false. Path only. If set to true, will make any un observables in the path into observables.</param>
		///<returns type="Object">An object with a dispose function to cancel the subscription.</returns>
		
        this.$observes++;
        
        if (/[\.\[]/.test(property)) {
            if (options)
                options = {
                    context: options.context, 
                    trackPartialObservable: options.trackPartialObservable, 
                    forceObserve: options.forceObserve
                };
            
            var pw = new busybody.observeTypes.pathObserver(this.$forObject || this, property, options);
            pw.registerDisposeCallback((function () {
                this.$observes--;
            }).bind(this));
            
            pw.onValueChanged(callback.bind((options ? options.context : false) || pw.forObject), false);
            this.registerDisposable(pw);
            return pw;
        }
        
        this._init(property);

        var cb = new busybody.callbacks.propertyCallback(callback, options);
        if (!this.$callbacks[property]) this.$callbacks[property] = [];
        this.$callbacks[property].push(cb);

		if (options && options.activateImmediately)
			cb.activate();
		else
			this.onNextPropertyChange(property, function (change) {
				cb.activate(change);
			});
        
        var dispose = {
            dispose: (function (allowPendingChanges) {

                if (!dispose) return;
                dispose = null;
                
                this.$observes--;
                
                if (allowPendingChanges)
                    this.onNextPropertyChange(property, function (change) {
                        cb.deactivate(change);
                    });
                else
                    cb.deactivate();
            }).bind(this)
        };
        
        this.registerDisposable(dispose);
        
        return dispose;
    };

    observableBase.prototype._init = function (forProperty) {
		///<summary>Begin observing a property</summary>
		///<param name="forProperty" type="String">The property</param>
		
        throw "Abstract methods must be implemented";
    };

    observableBase.prototype.dispose = function () {
		///<summary>Dispose fo this</summary>
		
        this._super();
        
        delete this.$forObject;
        for (var i in this.$callbacks)
            delete this.$callbacks[i];
    };
    
    observableBase.prototype.computed = function (property, callback, options) {
		///<summary>Create a computed which bind's to a property. The context of the callback will be this observable unless there is a context option.</summary>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The computed logic.</param>
		///<param name="options" type="Object" optional="true">See busybody.observeTypes.computed for options</param>
		///<returns type="busybody.observeTypes.computed">The computed</returns>
        
        if (!options)
            options = {context: this.$forObject || this};
        else if (!options.hasOwnProperty("context"))
            options.context = this.$forObject || this;
        
        var computed = new busybody.observeTypes.computed(callback, options);
        computed.bind(this.$forObject || this, property);
        this.registerDisposable(computed);
        return computed;        
    };
    
    observableBase.prototype.del = function (property) {
		///<summary>Delete a property and publish changes.</summary>
		///<param name="property" type="String">The property</param>
        
        delete (this.$forObject || this)[property];
    };
        
    observableBase.afterObserveCycle = function(callback) {
		///<summary>Execute a callback after each observe cycle.</summary>
		///<param name="callback" type="Function">The callback.</param>
		///<returns type="busybody.disposable">A dispose callback</returns>
		
        return busybody.utils.observeCycleHandler.instance.afterObserveCycle(callback);
    };

    observableBase.beforeObserveCycle = function(callback) {
		///<summary>Execute a callback before each observe cycle.</summary>
		///<param name="callback" type="Function">The callback.</param>
		///<returns type="busybody.disposable">A dispose callback</returns>
		
        return busybody.utils.observeCycleHandler.instance.beforeObserveCycle(callback);
    };

    observableBase.afterNextObserveCycle = function (callback, waitForNextCycleToStart) {
		///<summary>Execute a callback after the next observe cycle.</summary>
		///<param name="callback" type="Function">The callback.</param>
		///<param name="waitForNextCycleToStart" type="Boolean" options="true">If false and there is no observe cycle running, will execute the callback immediately.</param>
		///<returns type="busybody.disposable">A dispose callback</returns>

        if (!waitForNextCycleToStart && busybody.utils.observeCycleHandler.instance.length === 0) {
            callback();
            return;
        }

        var dispose = busybody.utils.observeCycleHandler.instance.afterObserveCycle(function () {
            dispose.dispose();
            callback();
        });

        return dispose;
    };

    observableBase.beforeNextObserveCycle = function (callback) {
		///<summary>Execute a callback before the next observe cycle.</summary>
		///<param name="callback" type="Function">The callback.</param>
		///<returns type="busybody.disposable">A dispose callback</returns>

        var dispose = busybody.utils.observeCycleHandler.instance.beforeObserveCycle(function () {
            dispose.dispose();
            callback();
        });

        return dispose;
    };
    
    return observableBase;
});


Class("busybody.callbacks.changeCallback", function () {
        
    var changeCallback = orienteer.extend(function changeCallback(evaluateOnEachChange) {
		///<summary>Base class for change callback handlers</summary>
		///<param name="evaluateOnEachChange" type="Boolean">Default: false. Evaluate once for each change rather than on an amalgamation of changes</param>
		
        this._super();
        
		///<summary type="Boolean">Default: false. Evaluate once for each change rather than on an amalgamation of changes</summary>
        this.evaluateOnEachChange = evaluateOnEachChange;
    });
    
    // remove this callback flag
    changeCallback.dispose = {};
    
    changeCallback.prototype.activate = function (activatingChange) {
		///<summary>Activate this callback</summary>
		///<param name="activatingChange" type="Object" optional="true">The first change to execute on</param>
		
        if (this._activated || this._activatingChange)
            throw "This callback has been activated";
        
		if (!arguments.length)
			this._activated = true;
		else if (activatingChange == null)
			throw "Invalid change";
		else
        	this._activatingChange = activatingChange;
    };
    
    changeCallback.prototype.deactivate = function (deactivatingChange) {
		///<summary>Deactivate this callback</summary>
		///<param name="deactivatingChange" type="Object" optional="true">The first change to deactivate on</param>
		
        if (this._deactivatingChange)
            throw "This callback has a deactivate pending";
        
        if (!arguments.length)
            this._activated = false;
        else if (deactivatingChange == null)
			throw "Invalid change";
		else
            this._deactivatingChange = deactivatingChange;
    };

    changeCallback.prototype.evaluateSingle = function (changes, changeIndex) {
		///<summary>Evaluate a single change</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<param name="changeIndex" type="Number">The index of the change to execute</param>
		///<returns type="Any">The return value of the callback</returns>
        
        if (!this.evaluateOnEachChange) return;

        if (this._activated === false || (this.hasOwnProperty("_deactivatingChange") && this._deactivatingChange === changes[changeIndex])) {
            this._activated = false;
            return changeCallback.dispose;
        }

        if (!this.hasOwnProperty("_activated")) {
            if (this.hasOwnProperty("_activatingChange") && this._activatingChange === changes[changeIndex]) {
                this._activated = true;
                delete this._activatingChange;
            } else
                return;
        }
        
        this._evaluateSingle(changes, changeIndex);
    };
    
    changeCallback.prototype._evaluateSingle = function (changes, changeIndex) {
		///<summary>Abstract. Evaluate a single change</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<param name="changeIndex" type="Number">The index of the change to execute</param>
		///<returns type="Any">The return value of the callback</returns>
		
        throw "Abstract methods must be implemented";
    };

    changeCallback.prototype.evaluateMultiple = function (changes) {
		///<summary>Evaluate on batch of changes</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<returns type="Any">The return value of the callback</returns>
		
        if (this.evaluateOnEachChange || !changes.length) return;

        if (this._activated === false) return changeCallback.dispose;
        
        var beginAt = 0, endAt = changes.length, output = undefined;
        if (!this.hasOwnProperty("_activated")) {
            beginAt = changes.indexOf(this._activatingChange);
            if (beginAt !== -1) {            
                this._activated = true;
                delete this._activatingChange;
            }
            
            // if == -1 case later on
        }

        if (this._deactivatingChange) {
            endAt = changes.indexOf(this._deactivatingChange);
            if (endAt === -1) {
                endAt = changes.length;                
            } else {
                output = changeCallback.dispose;
                this._activated = false;
                delete this._deactivatingChange;
            }
        }
                
        if (beginAt !== -1 && beginAt < endAt) {
            this._evaluateMultiple(changes, beginAt, endAt);
        }
        
        return output;
    };
    
    changeCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
		///<summary>Evaluate on batch of changes</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<param name="beginAt" type="Number">The index of the first change to execute</param>
		///<param name="endAt" type="Number">The index of the change after the last change to execute</param>
		///<returns type="Any">The return value of the callback</returns>
		
        throw "Abstract methods must be implemented";
    };
    
    return changeCallback;
});

Class("busybody.arrayBase", function () {
        
    var arrayBase = orienteer.extend.call(Array, function arrayBase (initialValues) {
		///<summary>A base for arrays using or not using Object.observe</summary>
		///<param name="initialValues" type="[Any]">Initial values for the array</param>
        
        Array.call(this);
        
        if (arguments.length)
            if (!(arguments[0] instanceof Array))
                throw "The initial values must be an array";
        
		///<summary type="[busybody.disposable]">Items to despose of with this</summary>
        this.$disposables = [];
		
		///<summary type="[Array]">Arrays which are obund to this</summary>
        this.$boundArrays = [];
		
		///<summary type="[busybody.callbacks.arrayCallback]">On change callbacks</summary>
        this.$callbacks = [];
		
		///<summary type="[Object]">The current change batch</summary>
        this.$changeBatch = [];
		
		///<summary type="Number">The length property of an array base is dynamic. $length is the cached value. You can use this value, but do not write to it</summary>
        this.$length = initialValues ? initialValues.length : 0;    
        
        if (initialValues)
            for(var i = 0, ii = initialValues.length; i < ii; i++)
                this[i] = initialValues[i]; // doing it this way as it will not publish changes
    });
    
    arrayBase.prototype._super = orienteer.prototype._super;
    arrayBase.extend = orienteer.extend;
    
    arrayBase.isValidArrayChange = function (change) {
		///<summary>Returns whether the change is to the array elements or an array property</summary>
		///<param name="change" type="Object">The change</param>
		///<returns type="Boolean">Result</returns>
		
        return change.type === "splice" || !isNaN(parseInt(change.name));
    };
         
    arrayBase.prototype.onNextArrayChange = function (callback) {
		///<summary>Fire a callback once, the next array change</summary>
		///<param name="callback" type="Function">The callback</param>
        
        throw "Abstract methods must be implemented";
    };
         
    arrayBase.prototype.processChangeBatch = function () {
		///<summary>Process the current batch of changes</summary>
        
        var changeBatch = this.$changeBatch.slice();
        this.$changeBatch.length = 0;

        busybody.utils.observeCycleHandler.instance.execute(this, (function () {
        	enumerateArr(busybody.observableBase.processChanges(this.$callbacks, changeBatch), function (c) { c(); });
		}).bind(this));
    };
    
    arrayBase.prototype.registerChangeBatch = function (changes) {
		///<summary>Register a batch of changes to this array</summary>
		///<param name="changes" type="[Object]">The changes</param>
        
        // not interested in property changes
        for (var i = changes.length - 1; i >= 0; i--)
            if (!arrayBase.isValidArrayChange(changes[i]))
                changes.splice(i, 1);
        
        return busybody.observableBase.prototype.registerChangeBatch.call(this, changes);
    };
            
    function changeIndex(index) {
        if (typeof index === "number" && index % 1 === 0) {
            return index;
        } else if (index === null) {
            return 0;
        } else if (typeof index === "boolean") {
            return index ? 1 : 0;
        } else if (typeof index === "string" && !isNaN(index = parseFloat(index)) && index % 1 === 0) {
            return index;
        }

        return undefined;
    }

    Object.defineProperty(arrayBase.prototype, "length", {
        set: function(v) {
            if ((v = changeIndex(v)) === undefined) 
                throw RangeError("Invalid array length");

            if (v === this.$length)
                return;

            if(!this.__alteringArray) {
                if(v > this.$length) {
                    var args = new Array(v - this.length + 2);
                    args[0] = this.length;
                    args[1] = 0;
                    this.splice.apply(this, args);
                } else if(v < this.$length) {
                    this.splice(v, this.length - v);
                }
            }
			
            this.$length = v;
        },
        get: function() {
            return this.$length;
        }
    });

    arrayBase.prototype._init = function () {
		///<summary>Begin observing</summary>
		
        throw "Abstract methods must be implemented";
    };
    
    arrayBase.prototype.observe = function (callback, options) {
		///<summary>Observe for array changes</summary>
		///<param name="callback" type="Function">The callback</param>
		///<param name="options" type="Object" optional="true">Options on when the callback is executed and what it's args will be</param>
		///<param name="options.context" type="Any">Default: null. The "this" value in the callback</param>
		///<param name="options.useRawChanges" type="Boolean">Default: false. Use the change objects from the Array.observe as arguments</param>
		///<param name="options.evaluateOnEachChange" type="Boolean">Default: false. Evaluate once for each change rather than on an amalgamation of changes</param>
		///<returns type="busybody.disposable">A disposable</returns>
		
        if (typeof arguments[0] === "string") {			
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 0, this);
            return busybody.observe.apply(null, args);
        }
		
		return this.addCallback(new busybody.callbacks.arrayCallback(callback, options));
    };
	
	arrayBase.prototype.disposableFor = function (changeCallback) {
		///<summary>Create an object to dispose of a changeCallback</summary>
		///<param name="changeCallback" type="busybody.callbacks.arrayCallback">The callback</param>
		///<returns type="Object">A disposable</returns>
		
		var dispose = {
			dispose: (function (allowPendingChanges) {

				if (!dispose) return;
				dispose = null;

				if (allowPendingChanges)
					this.onNextArrayChange(function (change) {
						changeCallback.deactivate(change);
					});
				else
					changeCallback.deactivate();
			}).bind(this)
		};
		
		return dispose;
	};
    
	var boundArrayStopKey = "busybody-do-not-apply-to";
    arrayBase.prototype.alteringArray = function(method, args) {
		///<summary>Execute logic which will alter this array. Apply changes to any bound arrays.</summary>
		///<param name="method" type="String">A method pointer which will alter the array</param>
		///<param name="args" type="Array">The arguments to the method</param>
				
        if (this.__alteringArray)
            throw "Calls to alteringArray must be synchronus and not nested.";
			
		try {
			this.__alteringArray = true;
			
			enumerateArr(this.$boundArrays, function (array) {
				if (array[boundArrayStopKey])
					throw "Circular reference in array bindings found";
				
				if (this[boundArrayStopKey] === array) return;
								
				array[boundArrayStopKey] = this;
				array[method].apply(array, args);
			}, this);
			
			return Array.prototype[method].apply(this, args);
		} finally {
			this.__alteringArray = false;
			enumerateArr(this.$boundArrays, function (array) {
				delete array[boundArrayStopKey];
			});
		}
    };

    arrayBase.copyAll = function (from, to, convert) {
		///<summary>Copy the contents of one array to another</summary>
		///<param name="from" type="Array">The from array</param>
		///<param name="to" type="Array">The to array</param>
		///<param name="convert" type="Function">A function to convert values before copy</param>
        
        var args;
        if (convert) {
            args = [];
            enumerateArr(from, function (item) {
                args.push(convert(item));
            });
        } else {
            args = from.slice();
        }
        
        args.splice(0, 0, 0, to.length);
        to.splice.apply(to, args);
    };
    
    arrayBase.prototype.bind = function(anotherArray) {
		///<summary>Bind arrays</summary>
		///<param name="anotherArray" type="Array">The other array</param>
		///<returns type="busybody.disposable">A disposable</returns>
        
        if (!anotherArray || this.$boundArrays.indexOf(anotherArray) !== -1) return;
		
		this.$boundArrays.push(anotherArray);
        
        if (!(anotherArray instanceof busybody.array) || anotherArray.$boundArrays.indexOf(this) === -1)
            arrayBase.copyAll(this, anotherArray);
		
		return new busybody.disposable((function () {
			if (!anotherArray) return;
			var i;
			if ((i = this.$boundArrays.indexOf(anotherArray)) !== -1)
				this.$boundArrays.splice(i, 1);
			
			anotherArray = null;
		}).bind(this));
    };
	
	arrayBase.prototype.addCallback = function (callback) {
		///<summary>Add an array callback</summary>
		///<param name="callback" type="busybody.callbacks.arrayCallback">The callback</param>
		///<returns type="busybody.disposable">A disposable</returns>
		
        this._init();

        this.$callbacks.push(callback);

        this.onNextArrayChange(function (change) {
            callback.activate(change);
        });
        
        var dispose = this.disposableFor(callback);
        
        this.$disposables.push(dispose);
        
        return dispose;
	};
    
    arrayBase.prototype.dispose = function() {
		///<summary>Dispose of the array</summary>
		
        enumerateArr(this.$disposables, function (d) {
            d.dispose();
        });
        
        this.$disposables.length = 0;        
        this.$boundArrays.length = 0;
        this.$callbacks.length = 0;
    };
    
    return arrayBase;
});

useObjectObserve ?
Class("busybody.array", function () {
    
    var array = busybody.arrayBase.extend(function array (initialValues) {
		///<summary>An observable array</summary>
		///<param name="initialValues" type="[Any]">Initial values for the array</param>
		
		if (!(this instanceof array))
			return new array(initialValues);
		
        this._super.apply(this, arguments);
    });
         
    array.prototype.onNextArrayChange = function (callback) {
		///<summary>Fire a callback once, the next array change</summary>
		///<param name="callback" type="Function">The callback</param>

        var cb = (function (changes) {
            if (!cb) return;
            for (var i = 0, ii = changes.length; i < ii; i++) {
                if (busybody.arrayBase.isValidArrayChange(changes[i])) {    
                    Array.unobserve(this, cb);
                    cb = null;
                    callback(changes[i]);
                    return;
                }
            }
        }).bind(this);

        Array.observe(this, cb);
    };
    
    array.prototype.captureArrayChanges = function (logic, callback) {
		///<summary>Capture all of the changes to the array perpetrated by the logic</summary>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
        
        var cb = function (changes) {
            changes = changes.slice();
            for (var i = changes.length - 1; i >= 0; i--)
                if (!busybody.arrayBase.isValidArrayChange(changes[i]))
                    changes.splice(i, 1);

            callback(changes);
        };
        
        Array.observe(this, cb);
        logic();
        Array.unobserve(this, cb);
    };

    array.prototype._init = function () {
		///<summary>Begin observing</summary>
		
        if (this.__subscription) return;
        
        this.__subscription = this.registerChangeBatch.bind(this);
        Array.observe(this, this.__subscription);
    };
    
    array.prototype.dispose = function () {
		///<summary>Dispose of this</summary>
		
        this._super();        
        
        if (this.__subscription) {
            Array.unobserve(this, this.__subscription);
            delete this.__subscription;
        }
    };
		///<summary>Capture all of the changes to the array perpetrated by the logic</summary>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
    
    return array;
}) :
Class("busybody.array", function () {
    
    var array = busybody.arrayBase.extend(function array (initialValues) {
		///<summary>An observable array</summary>
		///<param name="initialValues" type="[Any]">Initial values for the array</param>
		
		if (!(this instanceof array))
			return new array(initialValues);
        
        this._super.apply(this, arguments);
        
		///<summary type="[Function]">Callbacks to fire the next time the array changes</summary>
        this.$onNextArrayChanges = [];
		
		///<summary type="[Function]">Callbacks which capture changes to the array</summary>
        this.$captureCallbacks = [];
    }); 
    
    array.prototype.captureArrayChanges = function (logic, callback) {
		///<summary>Capture all of the changes to the array perpetrated by the logic</summary>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
        
        var cb = function (changes) {
            changes = changes.slice();
            for (var i = changes.length - 1; i >= 0; i--)
                if (!busybody.arrayBase.isValidArrayChange(changes[i]))
                    changes.splice(i, 1);

            callback(changes);
        };
        
        this.$captureCallbacks.push(cb);
        logic();
        this.$captureCallbacks.splice(this.$captureCallbacks.indexOf(cb), 1);
    };
    
    array.prototype.registerChangeBatch = function (changes) {
		///<summary>Register a batch of changes to this array</summary>
		///<param name="changes" type="[Object]">The changes</param>
		
        for (var i = 0, ii = changes.length; i < ii; i++) {
            if (busybody.arrayBase.isValidArrayChange(changes[i])) {
                enumerateArr(this.$onNextArrayChanges.splice(0, this.$onNextArrayChanges.length), function (cb) {
                    cb(changes[i]);
                });
                
                break;
            }
        }
        
        enumerateArr(this.$captureCallbacks, function (cb) {
            cb(changes);
        });
        
        return this._super(changes);
    };
         
    array.prototype.onNextArrayChange = function (callback) {
		///<summary>Fire a callback once, the next array change</summary>
		///<param name="callback" type="Function">The callback</param>

        this.$onNextArrayChanges.push(callback);
    };

    array.prototype._init = function () {
		///<summary>Begin observing</summary>
		
        // unneeded
    };
    
    return array;
});

(function () {
    
    var array = busybody.array;
    
    array.prototype.replace = function(index, replacement) {
		///<summary>Replace an element in the array and notify the change handler</summary>
		///<param name="index" type="Number">The index</param>
		///<param name="replacement" type="Any">The replacement</param>
		///<returns type="Any">The replacement</returns>
		
		this.splice(index, index >= this.length ? 0 : 1, replacement);
        return replacement;
    };

    array.prototype.pop = function() {
		///<summary>Remove and return the last element of the array</summary>
		///<returns type="Any">The value</returns>

        if (!useObjectObserve)
            if (this.length)
                this.registerChangeBatch([{
                    addedCount: 0,
                    index: this.length - 1,
                    object: this,
                    removed: [this[this.length - 1]],
                    type: "splice"
                }]);

        return this.alteringArray("pop");
    };

    array.prototype.shift = function() {
		///<summary>Remove and return the first element in the array</summary>
		///<returns type="Any">The value</returns>

        if (!useObjectObserve)
            if (this.length)
                this.registerChangeBatch([{
                    addedCount: 0,
                    index: 0,
                    object: this,
                    removed: [this[0]],
                    type: "splice"
                }]);

        return this.alteringArray("shift");
    };

    array.prototype.remove = function(item) {
		///<summary>Remove an item from the array and reduce the length by 1</summary>
		///<param name="item" type="Any">The item</param>
		///<returns type="Boolean">Whether the array contained the element or not</returns>

        var i;
        if ((i = this.indexOf(item)) !== -1) {
            this.splice(i, 1);
			return true;
		}
		
		return false;
    };

    array.prototype.push = function() {
		///<summary>Add all of the arguments to the end of this array</summary>
		///<returns type="Number">The new length</returns>

        if (!useObjectObserve)
            this.registerChangeBatch([{
                addedCount: arguments.length,
                index: this.length,
                object: this,
                removed: [],
                type: "splice"
            }]);

        return this.alteringArray("push", arguments);
    };

    array.prototype.reverse = function() {
		///<summary>Reverse the contents of this array</summary>

		var length = this.length;
		if (length < 2) return;
		
        if (!useObjectObserve) {
                
            var half = Math.floor(length / 2), cb = [], i2;
            for (var i = 0; i < half; i++) {
            
                cb.push({
                    name: i.toString(),
                    object: this,
                    oldValue: this[i],
                    type: "update"
                });
				
				i2 = length - i - 1;
                cb.push({
                    name: i2.toString(),
                    object: this,
                    oldValue: this[i2],
                    type: "update"
                });
            }
			
            this.registerChangeBatch(cb);
        }
        
        return this.alteringArray("reverse");
    };

    array.prototype.sort = function(sortFunction) {
		///<summary>Sort the elements in the array</summary>
		///<param name="sortFunction" type="Function">A function to compare items</param>
		///<returns type="Array">this</returns>
		
        if (!useObjectObserve) {
                
			var copy = this.slice(), cb = [];
        	var output = this.alteringArray("sort", arguments);
			
			for (var i = 0, ii = copy.length; i < ii; i++)
				if (copy[i] !== this[i])
					cb.push({
						name: i.toString(),
						object: this,
						oldValue: copy[i],
						type: "update"
					});
			
            this.registerChangeBatch(cb);			
			return output;
        }
        
        return this.alteringArray("sort", arguments);
    };

    array.prototype.splice = function(index, removeCount, addItems) {
		///<summary>Add and remove items from an array</summary>
		///<param name="index" type="Number">The point in the array to begin</param>
		///<param name="removeCount" type="Number">The number of items to remove</param>
		///<param name="addItems" type="Any" optional="true">All other arguments will be added to the array</param>
		
        if (!useObjectObserve) {
            var removed = [];
            for(var i = index, ii = removeCount + index > this.length ? this.length : removeCount + index; 
                i < ii; 
                i++)
                removed.push(this[i]);

            this.registerChangeBatch([{
                addedCount: arguments.length - 2,
                index: index,
                object: this,
                removed: removed,
                type: "splice"
            }]);
        }

        return this.alteringArray("splice", arguments);
    };

    //TODO
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
}());


Class("busybody.callbacks.arrayCallback", function () {
        
    var arrayCallback = busybody.callbacks.changeCallback.extend(function arrayCallback(callback, options) {
		///<summary>Evaluate array changes</summary>
		///<param name="callback" type="Function">The callback to execute</param>
		///<param name="options" type="Object" optional="true">Options for the callback</param>
		///<param name="options.context" type="Any">Default: null. The "this" value in the callback</param>
		///<param name="options.useRawChanges" type="Boolean">Default: false. Use the change objects from the Array.observe as arguments</param>
		///<param name="options.evaluateOnEachChange" type="Boolean">Default: false. Evaluate once for each change rather than on an amalgamation of changes</param>
		
        this._super(options && options.evaluateOnEachChange);
        
		///<summary type="Boolean">Use the change objects from the Array.observe as arguments</summary>
		this.useRawChanges = options && options.useRawChanges;
		
		///<summary type="Function">The callback to execute</summary>
        this.callback = callback;
		
		///<summary type="Any" optional="true">The "this" in the callback</summary>
        this.context = options ? options.context : null;
    });

    arrayCallback.prototype._evaluateSingle = function (changes, index) {
		///<summary>Evaluate a single change</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<param name="index" type="Number">The index of the change to execute</param>
		///<returns type="Any">The return value of the callback</returns>

        this.callback.call(this.context, changes[index]);
    };

    arrayCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
		///<summary>Evaluate on batch of changes</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<param name="beginAt" type="Number">The index of the first change to execute</param>
		///<param name="endAt" type="Number">The index of the change after the last change to execute</param>
		///<returns type="Any">The return value of the callback</returns>
		
		if (this.useRawChanges) {
			this.callback.call(this.context, changes.slice(beginAt, endAt));
			return;
		}
                
        if (!changes.compiled)
            changes.compiled = [];
        
        var result;
        for (var i = 0, ii = changes.compiled.length; i < ii; i++) {
            if (changes.compiled[i].areEqual(beginAt, endAt)) {
                result = changes.compiled[i];
                break;
            }
        }
        
        if (!result)
            changes.compiled.push(result = new busybody.utils.compiledArrayChange(changes, beginAt, endAt));
        
        this._evaluateArrayMultiple(result);
    };

    arrayCallback.prototype._evaluateArrayMultiple = function (result) {
		///<summary>Evalue the callback</summary>
		///<param name="result" type="busybody.utils.compiledArrayChange">Inputs for the callback</param>
		///<returns type="Any">The return value of the callback</returns>
        
        this.callback.call(this.context, result.getRemoved(), result.getAdded(), result.getIndexes());
    };
    
    return arrayCallback;
});


Class("busybody.callbacks.propertyCallback", function () {
        
    var propertyCallback = busybody.callbacks.changeCallback.extend(function propertyCallback(callback, options) {
		///<summary>Evaluate property changes</summary>
		///<param name="callback" type="Function">The callback to execute</param>
		///<param name="options" type="Object" optional="true">Options for the callback</param>
		///<param name="options.context" type="Any" optional="true">Default: null. The "this" in the callback</param>
		///<param name="options.useRawChanges" type="Boolean">Default: false. Use the change objects from the Array.observe as arguments</param>
		///<param name="options.evaluateOnEachChange" type="Boolean">Default: false. Evaluate once for each change rather than on an amalgamation of changes</param>
		///<param name="options.evaluateIfValueHasNotChanged" type="Boolean">Default: false. Evaluate if the oldValue and the newValue are the same</param>
		
        this._super(options && options.evaluateOnEachChange);
        
		///<summary type="Function">The callback to execute</summary>
        this.callback = callback;
		
		///<summary type="Any">The "this" in the callback</summary>
        this.context = options ? options.context : null;
		
		///<summary type="Boolean">Default: false. Evaluate if the oldValue and the newValue are the same</summary>
        this.evaluateIfValueHasNotChanged = options && options.evaluateIfValueHasNotChanged;
		
		///<summary type="Boolean">Default: false. Evaluate if the oldValue and the newValue are the same</summary>
		this.useRawChanges = options && options.useRawChanges;
    });

    propertyCallback.prototype._evaluateSingle = function (changes, index) {
		///<summary>Evaluate a single change</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<param name="index" type="Number">The index of the change to execute</param>
		///<returns type="Any">The return value of the callback</returns>

        var change = changes[index], 
            nextChange = changes[index + 1], 
            newVal = nextChange ? nextChange.oldValue : change.object[change.name];
        
		if (this.useRawChanges)
            this.callback.call(this.context, change);
        else if (this.evaluateIfValueHasNotChanged || newVal !== change.oldValue)
            this.callback.call(this.context, change.oldValue, newVal);
    };

    propertyCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
		///<summary>Evaluate on batch of changes</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<param name="beginAt" type="Number">The index of the first change to execute</param>
		///<param name="endAt" type="Number">The index of the change after the last change to execute</param>
		///<returns type="Any">The return value of the callback</returns>
		
		var newVal = changes[endAt] ? changes[endAt].oldValue : changes[0].object[changes[0].name];
        
		if (this.useRawChanges)
            this.callback.call(this.context, changes.slice(beginAt, endAt));
        else if (this.evaluateIfValueHasNotChanged || newVal !== changes[beginAt].oldValue)
            this.callback.call(this.context, changes[beginAt].oldValue, newVal);
    };
    
    return propertyCallback;
});

    
var observable = useObjectObserve ?
    Class("busybody.observable", function () {
        var observable = busybody.observableBase.extend(function observable(forObject) {
			///<summary>An object whose properties can be subscribed to</summary>
			///<param name="forObject" type="Object" optional="true">Observe changes to another object</param>
			
            this._super(forObject);
        });

        observable.prototype.onNextPropertyChange = function (property, callback) {
			///<summary>Fire a callback once, the next property change</summary>
			///<param name="property" type="String">The property to observe</param>
			///<param name="callback" type="Function">The callback</param>

            var cb = (function (changes) {
                if (!cb) return;
                for (var i = 0, ii = changes.length; i < ii; i++) {
                    if (changes[i].name == property) {	// in this case numbers and strings are the same
                        var _cb = cb;
                        Object.unobserve(this.$forObject || this, _cb);
                        cb = null;
                        callback(changes[i]);
                        return;
                    }
                }
            }).bind(this);

            Object.observe(this.$forObject || this, cb);
        };

        observable.prototype._captureChanges = function (logic, callback) {
			///<summary>Capture all of the changes to the property perpetrated by the logic</summary>
			///<param name="logic" type="Function">The function which will change the array</param>
			///<param name="callback" type="Function">The callback (function (changes) { })</param>
			///<param name="toProperty" type="String">The property</param>
			
			Object.observe(this.$forObject || this, callback);
			logic();
			Object.unobserve(this.$forObject || this, callback);
        };

        observable.prototype._init = function () {
			///<summary>Begin observing a property</summary>
			///<param name="forProperty" type="String">The property</param>
			
            if (this.__subscribeCallback) return;

            this.__subscribeCallback = this.registerChangeBatch.bind(this);
            Object.observe(this.$forObject || this, this.__subscribeCallback);
        };

        observable.prototype.dispose = function () {
			///<summary>Dispose</summary>
			
            this._super();

            if (this.__subscribeCallback) {
                Object.unobserve(this.$forObject || this, this.__subscribeCallback);
                delete this.__subscribeCallback;
            }
        };

        return observable;
    }) :
    Class("busybody.observable", function () {
        var observable = busybody.observableBase.extend(function observable(forObject) {
			///<summary>An object whose properties can be subscribed to</summary>
			///<param name="forObject" type="Object" optional="true">Observe changes to another object</param>
			
            this._super(forObject);

            this.$observed = {};
            this.$onNextPropertyChanges = {};
            this.$captureCallbacks = [];
        });

        observable.prototype.onNextPropertyChange = function (property, callback) {
			///<summary>Fire a callback once, the next property change</summary>
			///<param name="property" type="String">The property to observe</param>
			///<param name="callback" type="Function">The callback</param>

            (this.$onNextPropertyChanges[property] || (this.$onNextPropertyChanges[property] = [])).push(callback);
        };

        observable.prototype._captureChanges = function (logic, callback) {
			///<summary>Capture all of the changes to the property perpetrated by the logic</summary>
			///<param name="logic" type="Function">The function which will change the array</param>
			///<param name="callback" type="Function">The callback (function (changes) { })</param>
			///<param name="toProperty" type="String">The property</param>

            this.$captureCallbacks.push(callback);
            logic();
            this.$captureCallbacks.splice(this.$captureCallbacks.indexOf(callback), 1);
        };

		//TODO: prototype
        function getObserver(forObject) { return forObject.$observer || forObject; }
        observable.prototype._init = function (forProperty) {
			///<summary>Begin observing a property</summary>
			///<param name="forProperty" type="String">The property</param>

            if (this.$observed.hasOwnProperty(forProperty)) return;

            this.$observed[forProperty] = (this.$forObject || this)[forProperty];
            Object.defineProperty(this.$forObject || this, forProperty, {
                get: function() {
                    return getObserver(this).$observed[forProperty];
                },
                set: function (value) {

                    var obs = getObserver(this);
                    var change = {
                        type: obs.$observed.hasOwnProperty(forProperty) ? "update" : "add",
                        name: forProperty,
                        object: this,
                        oldValue: obs.$observed[forProperty]
                    };
                    obs.$observed[forProperty] = value;
                    if (obs.$onNextPropertyChanges[forProperty]) {
                        var callbacks = obs.$onNextPropertyChanges[forProperty];
                        delete obs.$onNextPropertyChanges[forProperty];
                        setTimeout(function () {
                            enumerateArr(callbacks, function (a) {
                                a(change);
                            });
                        });
                    }

                    obs.addChange(change);

                },
                enumerable: true,
                configurable: true
            });
        };
        
        observable.prototype.addChange = function (change) {
			///<summary>Add a change to the batch</summary>
			///<param name="change" type="Object">The change</param>
            
            if (!this.__changeToken) {
                this.__changeToken = [];
                setTimeout((function () {
                    var ct = this.__changeToken;
                    delete this.__changeToken;                    
                    this.registerChangeBatch(ct);
                }).bind(this));
            }
            
            this.__changeToken.push(change);
            enumerateArr(this.$captureCallbacks, function (cb) {
                cb([change]);
            });          
        };
    
        observable.prototype.del = function (property) {
			///<summary>Delete a property and publish changes.</summary>
			///<param name="property" type="String">The property</param>

            (this.$forObject || this)[property] = undefined;
            this._super(property);
        }

        observable.prototype.dispose = function () {
			///<summary>Dispose.</summary>
			
            var _this = this.$forObject || this;
            for (var i in this.$observed) {
                // delete setter
                delete _this[i];
                _this[i] = this.$observed[i];
                delete this.$observed[i];
            }
            
            this._super();
                
            for (var i in this.$onNextPropertyChanges)
                delete this.$onNextPropertyChanges[i];
        };

        return observable;
    });

//TODO: look into esprima and falafel

Class("busybody.observeTypes.computed", function () {
    
    var WITH = /\s*with\s*\(/g;
    var GET_ARGUMENT_NAMES = /([^\s,]+)/g;
    var STRIP_INLINE_COMMENTS = /\/\/.*$/mg;  
    var STRIP_BLOCK_COMMENTS = /\/\*[\s\S]*?\*\//mg;
    var GET_ITEMS = "((\\s*\\.\\s*([\\w\\$]*))|(\\s*\\[\\s*\\d\\s*\\]))+"; // ".propertyName" -or- "[2]"
    var completeArg = {};
	
    var computed = busybody.observeTypes.observeTypesBase.extend(function computed(callback, options) {
		///<summary>A value defined by the return value of a function. If configured correctly, a change in a value within the function will trigger a re-execution of the function</summary>
		///<param name="callback" type="Function">The logic which returns the computed value</param>
		///<param name="options" type="Object" optional="true">Options on how the computed is composed</param>
		///<param name="options.context" type="Any">Default: null. The "this" value in the callback</param>
		///<param name="options.watchVariables" type="Object">Default: null. A dictionary of variables in the callback which are to be watched</param>
		///<param name="options.observeArrayElements" type="Boolean">Default: false. If set to true, the computed will attempt to watch values within any array watch variables. This is useful if the computed is an aggregate function. The default is false because it is expensive computationally</param>
		///<param name="options.allowWith" type="Boolean">Default: false. If set to true, "with (...)" statements are allowed in the computed function. Although variables accessed within the with statement cannot be observed</param>
		///<param name="options.delayExecution" type="Boolean">Default: false. If set to true, the computed will not be activated until it's execute function is called or a value within the computed changes</param>
		///<param name="options.trackPartialObservable" type="Boolean">Default: false. If set to true, will track observables at the end of a path, even if there are non observables before them.</param>
		///<param name="options.forceObserve" type="Boolean">Default: false. If set to true, will make any un observables in the path into observables.</param>
        
        this._super();
        
        options = options || {};
        
		///<summary type="Object">Describes how paths within this computed will be watched.</summary>
        this.pathObserverOptions = {
            trackPartialObservable: options.trackPartialObservable,
            forceObserve: options.forceObserve
        };
		
		///<summary type="[Any]">A list of arguments to be applied to the callback function</summary>
        this.arguments = []; 
		if (options.observeArrayElements)
			this.possibleArrays = [];
        
		///<summary type="[Function]">A list of callbacks which will be called when the computed value changes</summary>
		this.callbacks = [];
		
		///<summary type="String">The computed logic as a string with comments and strings removed</summary>
        this.callbackString = computed.stripFunction(callback);
		
		///<summary type="Function">The computed logic</summary>
        this.callbackFunction = callback;
		
		///<summary type="Any">The "this" in the computed logic</summary>
        this.context = options.context;
        
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
        
        // watch this
        if (this.context)
            this.watchVariable("this", this.context, options.observeArrayElements);
        
        // watch each watch variable
        if (options.watchVariables) {
            for (var i in options.watchVariables) {                
                this.watchVariable(i, options.watchVariables[i], options.observeArrayElements);
            }
        }
        
		if (!options.delayExecution)
        	this.execute();
    });
    
    computed.testForWith = function (input) {
		///<summary>Determine if a function string contains a "with (...)" call</summary>
		///<param name="input" type="String">The input</param>
		///<returns type="Boolean">The result</returns>
		
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
		///<summary>Execute the computed function</summary>
		///<returns type="Any">The result</returns>
		
		if (this.possibleArrays)
			this.rebuildArrays();
		
		return this.callbackFunction.apply(this.context, this.arguments);
    };
    
    computed.prototype.bind = function (object, property) {
		///<summary>Bind the value of this computed to the property of an object</summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The property</param>
		///<returns type="busybody.disposable">A dispose object</returns>
		
        var callback = computed.createBindFunction(object, property);
		var output = this.onValueChanged(callback, true);
        output.registerDisposable(callback);
		
        return output;
    };
    
    computed.prototype.onValueChanged = function (callback, executeImmediately) {
		///<summary>Execute a callback when the value of the computed changes</summary>
		///<param name="callback" type="Function">The callback: function (oldValue, newValue) { }</param>
		///<param name="executeImmediately" type="Boolean">If set to true the callback will be executed immediately with undefined as the oldValue</param>
		///<returns type="busybody.disposable">A dispose object to remove the callback</returns>
              
		var output = this.addCallback(callback);		
        if (executeImmediately)
            callback(undefined, this.val);
		
        return output;
    };
        
	//TODO: somehow retain "this.prop['val']"
    computed.stripFunction = function(input) {
		///<summary>Strip strings and comments from a function</summary>
		///<param name="input" type="Function">The functin</param>
		///<returns type="String">The striped function</returns>
		
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
		///<summary>Find all property paths of a given variable</summary>
		///<param name="variableName" type="String">The variable name</param>
		///<param name="complexExamination" type="Boolean">If set to true, the result will include the indexes of the property path as well as the actual text of the property paths</param>
		///<returns type="[Object]">The results</returns>
		
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
		///<summary>Create subscriptions to all of the property paths to a specific variable</summary>
		///<param name="variableName" type="String">The variable name</param>
		///<param name="variable" type="Any">The instance of the variable</param>
		///<param name="observeArrayElements" type="Boolean">If set to true, each find will also be treated as a possible array and subscribed to. This is a more expensive process computationally</param>
		
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
		///<summary>Discover whether a property path may be an indexed array</summary>
		///<param name="pathName" type="String">The property path</param>
		///<param name="index" type="Number">The location of the property path</param>
		///<returns type="String">The second half of the possible indexed array property, if any</returns>
		
		var found;
		if (found = getArrayItems.exec(this.callbackString.substr(index + pathName.length))) {
			found = found[0].substr(found[0].indexOf("]") + 1).replace(/\s/g, "");
			return (found[0] === "." ? found.substring(1) : found);
		}
	};
	
    computed.prototype.addPathWatchFor = function(variable, path) {
		///<summary>Add a path watch object, triggering an execute(...) when something chages</summary>
		///<param name="variable" type="Object">The path root</param>
		///<param name="path" type="String">The path</param>
		///<returns type="String">A disposable key. The path can be disposed by calling this.disposeOf(key)</returns>
		
		var path = new busybody.observeTypes.pathObserver(variable, path, this.pathObserverOptions);
        path.onValueChanged(this.execute.bind(this), false);
		
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
		///<summary>Create a function which will bind the result of the computed to either an object property or an array</summary>
		///<param name="bindToObject" type="Object">The object root</param>
		///<param name="bindToProperty" type="String">The path</param>
		///<returns type="Function">The bind function (function (oldValue, newValue) { }). The function has a dispose property which needs to be called to disposse of any array subscriptions</returns>
		
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

// name is subject to change

Class("busybody.observeTypes.pathObserver", function () {
        
    var pathObserver = busybody.observeTypes.observeTypesBase.extend(function pathObserver (forObject, property, options) {
        ///<summary>Observe a property path for change.</summary>
        ///<param name="forObject" type="busybody.observable" optional="false">The object to watch</param>
        ///<param name="property" type="String" optional="false">The property</param>
		///<param name="options" type="Object" optional="true">Options on how the path observer is composed</param>
		///<param name="options.trackPartialObservable" type="Boolean">Default: false. If set to true, will track observables at the end of a path, even if there are non observables before them.</param>
		///<param name="options.forceObserve" type="Boolean">Default: false. If set to true, will make any un observables in the path into observables.</param>
        
        this._super();
        
		///<summary type="Boolean">If set to true, will track observables at the end of a path, even if there are non observables before them.</summary>
        this.trackPartialObservable = options && options.trackPartialObservable;
        
		///<summary type="busybody.observable">The object to observe</summary>
        this.forObject = forObject;
		
		///<summary type="String">The path to observe</summary>
        this.property = property;
        
		///<summary type="[String]">The path split into parts</summary>
        this.path = busybody.utils.obj.splitPropertyName(property);
        
		///<summary type="Boolean">If an object in the path is not an observable, make it an observable.</summary>
        this.forceObserve = options && options.forceObserve;
        
		///<summary type="[busybody.observable]">The subscriptions</summary>
        this.__pathDisposables = new Array(this.path.length);
        this.execute();
        
        this.buildObservableChain();
    });
    
    pathObserver.prototype.onValueChanged = function (callback, evaluateImmediately) {
		///<summary>Add a new callback</summary>
		///<param name="callback" type="Function">The callback</param>
		///<param name="evaluateImmediately" type="Boolean" optional="true">If true, execute the callback now</param>
		///<returns type="busybody.disposable">A disposable to remove the callback</returns>
              
		var output = this.addCallback(callback);		
        if (evaluateImmediately)
            callback(undefined, this.val);
		
        return output;
    };
    
    pathObserver.prototype.buildObservableChain = function (begin) {
		///<summary>Rebuild the observable chain</summary>
		///<param name="begin" type="Number" optional="true">The first element to rebuild</param>
		
        begin = begin || 0;
        
        // dispose of anything in the path after the change
        for (var i = begin; i < this.path.length; i++) {
            if (this.__pathDisposables[i]) {
                this.__pathDisposables[i].dispose();
                if (this.__pathDisposables[i].unmakeObservable) this.__pathDisposables[i].unmakeObservable();
                this.__pathDisposables[i] = null;
            }
        }

        var current = this.forObject, _this = this;
        
        // get item at index "begin"
        for (i = 0; current && i < begin; i++) {
            current = current[this.path[i]];
        }
        
        // get the last item in the path subscribing to changes along the way
        for (; current && i < this.path.length; i++) {
            
            if (this.forceObserve && !busybody.canObserve(current) && 
                (busybody.makeObservable(current), busybody.canObserve(current))) {
                
                var unmakeObservable = (function (current) {
                    return function () {
                        if (!busybody.isObserved(current))
                            busybody.tryRemoveObserver(current);
                    };
                }(current));
            }
            
            if (busybody.canObserve(current) || current instanceof busybody.array) {
                
                var args = [current, (function (i) {
                    return function(oldVal, newVal) {
                        if (i < _this.path.length - 1)
                            _this.buildObservableChain(i);
						_this.execute();
                    };
                }(i))];
                
                if (isNaN(this.path[i]))
                    args.splice(1, 0, this.path[i]);
                
                this.__pathDisposables[i] = busybody.tryObserve.apply(null, args);
                this.__pathDisposables[i].unmakeObservable = unmakeObservable;
            } else if (!this.trackPartialObservable) {
                return;
            }

            current = current[this.path[i]];
        }
    };
        
    pathObserver.prototype.getValue = function() {
		///<summary>Evaluate the path observer</summary>
		///<returns type="Any">The value. Returns null rather than a TypeError</returns>
		
        var current = this.forObject;
        
        // get item at index "begin"
        for (var i = 0, ii = this.path.length; current != null && i < ii; i++) {
            current = current[this.path[i]];
        }
		
		return i === ii ? current : null;
    };
	
    pathObserver.prototype.dispose = function () {
		///<summary>Dispose of this path observer</summary>
		
        this._super();
        
        for (var i = 0, ii = this.__pathDisposables.length; i < ii && this.__pathDisposables[i]; i++)
            if (this.__pathDisposables[i]) {
                this.__pathDisposables[i].dispose();
                if (this.__pathDisposables[i].unmakeObservable) this.__pathDisposables[i].unmakeObservable();
            }

        this.__pathDisposables.length = 0;
    };
                                      
    return pathObserver;
});

// name is subject to change

Class("busybody.utils.compiledArrayChange", function () {
    
    function compiledArrayChange(changes, beginAt, endAt) {
		///<summary>Helper for compiling array change batches</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<param name="beginAt" type="Number">The index of the first change to process</param>
		///<param name="endAt" type="Number">The index of the change after the last change to process</param>
		
        this.beginAt = beginAt;
        this.endAt = endAt;
        this.changes = [];
        
        this.build(changes);
    }
    
    compiledArrayChange.prototype.buildIndexes = function () {
		///<summary>Evaluate the indexes in the batch</summary>
		
        if (this.indexes)
            return;
        
        var tmp, tmp2;
        
        var movedFrom = [],         // an item which was moved
            movedFromIndex = [],    // it's index
            movedTo = [],           // an item which was moved, the items index within this array is the same as the current index in the original array 
            addedIndexes = [],      // indexes of added items. Corresponds to this.added
            removedIndexes = [],    // indexes of removed items. Corresponds to this.removed
            moved = [];             // moved items
        
        // populate addedIndexes and movedTo
        var added = this.added.slice();
        enumerateArr(this.finalArray, function(item, i) {
            if (i >= this.beginArray.length || item !== this.beginArray[i]) {                
                if ((tmp = added.indexOf(item)) !== -1) {
                    addedIndexes.push({
                        value: item,
                        index: i
                    });
                    added.splice(tmp, 1);
                } else {
                    movedTo[i] = item;
                }              
            }
        }, this);
        
        // populate removedIndexes and movedFrom and movedFromIndexes
        var removed = this.removed.slice();
        enumerateArr(this.beginArray, function(item, i) {
            if (i >= this.finalArray.length || item !== this.finalArray[i]) {                
                if ((tmp = removed.indexOf(item)) !== -1) {
                    removedIndexes.push({
                        value: item,
                        index: i
                    });
                    removed.splice(tmp, 1);
                } else {
                    movedFrom.push(item);
                    movedFromIndex.push(i);
                }              
            }
        }, this);
        
        // use movedFrom, movedFromIndexes and movedTo to populate moved 
        var emptyPlaceholder = {};
        while (movedFrom.length) {
            tmp = movedFrom.shift();            
            tmp2 = movedTo.indexOf(tmp);
            movedTo[tmp2] = emptyPlaceholder;   // emptyPlaceholder stops this index from being found again by indexOf
            
            moved.push({
                value: tmp,
                from: movedFromIndex.shift(),
                to: tmp2              
            });
        }
        
        this.indexes = {
            moved: moved,
            added: addedIndexes,
            removed: removedIndexes
        };
    };
    
    //TODO: build based on shifts and adds
    
    compiledArrayChange.prototype.build = function (changes) {  
		///<summary>Evaluate the batch</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		
        this.removed = [];
        this.added = [];
        if (!changes.length || this.beginAt >= this.endAt) {
            this.indexes = {added:[], removed:[], moved:[]};
            return;
        }
        
        var array = changes[0].object.slice(), current, args, tmp, tmp2;
        for (var i = changes.length - 1; i >= this.beginAt; i--) {
            
            // operate on splices only
            current = changes[i].type === "splice" ? changes[i] : {
                addedCount: 1,
                index: parseInt(changes[i].name),
                removed: [changes[i].oldValue]
            };
            
            // begin to register changes after 
            if (i < this.endAt) {
                
                // this is the array after all changes
                if (!this.finalArray)
                    this.finalArray = array.slice();
                
                // add a removed or remmove from added items
                tmp2 = 0;
                enumerateArr(current.removed, function (removed) {
                    if ((tmp = this.added.indexOf(removed)) === -1) {
                        this.removed.splice(tmp2, 0, removed);
                        tmp2++;
                    } else {
                        this.added.splice(tmp, 1);
                    }
                }, this);

                // add an added or remmove from removed items
                tmp2 = 0;
                enumerateArr(array.slice(current.index, current.index + current.addedCount), function (added) {
                    if ((tmp = this.removed.indexOf(added)) === -1) {
                        this.added.splice(tmp2, 0, added);
                        tmp2++;
                    } else {
                        this.removed.splice(tmp, 1);
                    }
                }, this);
                
                this.changes.splice(0, 0, {
                    index: current.index,
                    added: array.slice(current.index, current.index + current.addedCount),
                    removed: current.removed,
                    change: changes[i]
                });
            }
            
            args = current.removed.slice();
            args.splice(0, 0, current.index, current.addedCount);
            array.splice.apply(array, args);
        }
        
        // this is the array before all changes
        this.beginArray = array.slice();
    };
    
    compiledArrayChange.prototype.areEqual = function (beginAt, endAt) {
		///<summary>Determine if two compiledArrayChanges are the same based on the first and last index</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<param name="beginAt" type="Number">The index of the first change to execute</param>
		///<param name="endAt" type="Number">The index of the change after the last change to execute</param>
		///<returns type="Boolean">The result</returns>
		
        return this.beginAt === beginAt && this.endAt === endAt;
    };
    
    compiledArrayChange.prototype.getRemoved = function () {
		///<summary>Get items removed in this batch</summary>
		///<returns type="[Any]">The items</returns>
		
        return this.removed.slice();
    };
    
    compiledArrayChange.prototype.getAdded = function () {
		///<summary>Get items added in this batch</summary>
		///<returns type="[Any]">The items</returns>
		
        return this.added.slice();
    };
    
    compiledArrayChange.prototype.getIndexes = function () {
		///<summary>Get detailed batch info</summary>
		///<returns type="Object">The items</returns>
		
        if (!this.indexes)
            this.buildIndexes();        
        
        return { 
            added: this.indexes.added.slice(),
            removed: this.indexes.removed.slice(),
            moved: this.indexes.moved.slice()
        };
    };
    
    return compiledArrayChange;    
});

// name is subject to change
//TODO: before/after observe cycle for specific object
Class("busybody.utils.observeCycleHandler", function () {
        
    var observeCycleHandler = busybody.observable.extend(function observeCycleHandler () {
		///<summary>Control observe cycles</summary>
		
        this._super();
        
		///<summary type="[Function]">Callbacks to execute before</summary>
        this.$afterObserveCycles = [];
		
		///<summary type="[Function]">Callbacks to execute after</summary>
        this.$beforeObserveCycles = [];
		
		///<summary type="Number">Current active cycles</summary>
        this.length = 0;
        
        this.observe("length", function (oldVal, newVal) {
            if (newVal === 0)
                enumerateArr(this.$afterObserveCycles.slice(), ex);
        }, {
            context: this,
			evaluateOnEachChange: false, 
			evaluateIfValueHasNotChanged: true
		});
    });
	
    observeCycleHandler.prototype.execute = function (forObject, executionLogic) {
		///<summary>Execute an obsder cycle</summary>
		///<param name="forObject" type="Any">The object</param>
		///<param name="executionLogic" type="FUnction">The logic</param>
		
		try {
			this.before(forObject);
			executionLogic();
		} finally {
        	this.after(forObject);
		}
	};

    function ex(callback) { callback(); }
    observeCycleHandler.prototype.before = function (forObject) {
		///<summary>Signal an observe cycle for an object has begun</summary>
		///<param name="forObject" type="Any">The object</param>
		
        if (forObject === this) return;
        
        if (this.length === 0)
            enumerateArr(this.$beforeObserveCycles.slice(), ex);
            
        this.length++;
    };
    
    observeCycleHandler.prototype.clear = function () {
		///<summary>Signal all observe cycles have ended</summary>
		
        if (this.length > 0) this.length = 0;
    };

    observeCycleHandler.prototype.after = function (forObject) {
		///<summary>Signal an observe cycle for an object has ended</summary>
		///<param name="forObject" type="Any">The object</param>
		
        if (forObject === this || this.length <= 0) return;
        
        this.length--;
    };

    observeCycleHandler.prototype.afterObserveCycle = function (callback) {
		///<summary>Execute after each observe cycle</summary>
		///<param name="callback" type="Function">The callback to execute</param>
		///<returns type="busybody.disposable">The dispose callback</returns>

        return busybody.utils.obj.addWithDispose(this.$afterObserveCycles, callback);
    };

    observeCycleHandler.prototype.beforeObserveCycle = function (callback) {
		///<summary>Execute before each observe cycle</summary>
		///<param name="callback" type="Function">The callback to execute</param>
		///<returns type="busybody.disposable">The dispose callback</returns>

        return busybody.utils.obj.addWithDispose(this.$beforeObserveCycles, callback);
    };

    observeCycleHandler.prototype.dispose = function () {
		///<summary>Dispose of this</summary>

		this._super();
		
        this.$afterObserveCycles.length = 0;
        this.$beforeObserveCycles.length = 0;
    };
    
    observeCycleHandler.instance = new observeCycleHandler();
    
    return observeCycleHandler;
});

    
    busybody.getObserver = function (object) {
		///<summary>Get the observer for an object, if any. The object's observer might be iself</summary>
		///<param name="object" type="Object">The object</param>
		///<returns type="busybody.observable">The observer</returns>
                
        return object == null || object instanceof busybody.observableBase ?
            object :
            (object.$observer instanceof busybody.observableBase ? object.$observer : null);
    };

    busybody.tryRemoveObserver = function (object) {
		///<summary>Remove the observer from an object, if possible. If there is no observer, or the object is it's own observer, do nothing</summary>
		///<param name="object" type="Object">The object</param>
		///<returns type="Boolean">Whether an observer was removed or not</returns>
        
        return object && 
            !(object instanceof busybody.observableBase) &&
            object.$observer instanceof busybody.observableBase &&
            (object.$observer.dispose(), delete object.$observer);
    };
    
    busybody.captureArrayChanges = function (forObject, logic, callback) {
		///<summary>Capture all of the changes to an array perpetrated by the logic</summary>
		///<param name="forObject" type="busybody.array">The array</param>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
		
        if (!(forObject instanceof busybody.array))
            throw "Only busybody.array objects can have changes captured";
        
        return forObject.captureArrayChanges(logic, callback);
    };
    
    busybody.captureChanges = function (forObject, logic, callback, property) {
		///<summary>Capture all of the changes to the property perpetrated by the logic</summary>
		///<param name="forObject" type="Object">The object</param>
		///<param name="logic" type="Function">The function which will change the array</param>
		///<param name="callback" type="Function">The callback (function (changes) { })</param>
		///<param name="property" type="String" optional="true">The property</param>
		
        forObject = busybody.getObserver(forObject);
        
		if (forObject)
        	return forObject.captureChanges(logic, callback, property);
		else
			logic();
    };

    busybody.makeObservable = function (object) {
		///<summary>Make an object observable</summary>
		///<param name="object" type="Object">The object</param>
		///<returns type="Object">The object</returns>
		
        if (!arguments.length)
            object = {};
        else if (!object)
            return object;
        
		if (object instanceof busybody.array) {
			if (busybody.getObserver(object)) 
				return object;
		} else if (busybody.canObserve(object)) {
			return object;
		}
        
        if (object.$observer) throw "The $observer property is reserved";

        Object.defineProperty(object, "$observer", {
            enumerable: false,
            configurable: true,
            value: new busybody.observable(object),
            writable: false
        });
        
        return object;
    };

    busybody.observe = function (object, property, callback, options) {
		///<summary>Observe changes to a property </summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback to execute</param>
		///<param name="options" type="Object" optional="true">See busybody.observable.observe for options</param>
		
        if (options)
            options.forceObserve = true;
        else
            options = { forceObserve: true };
        
        return busybody.tryObserve(object, property, callback, options);
    };

    busybody.tryObserve = function (object, property, callback, options) {
		///<summary>Observe changes to a property if possible. If "object" is not observable, return</summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback to execute</param>
		///<param name="options" type="Object" optional="true">See busybody.observable.observe for options</param>
        
        if (!object) return false;
        
        if (object instanceof busybody.array) {
			if (property instanceof Function)
            	return object.observe(arguments[1], arguments[2], arguments[3]);    // property names are misleading in this case
			if (property === "length")
				property = "$length";
			
			busybody.makeObservable(object);	//TODO: test
		}
        
        var target;
        if ((target = busybody.getObserver(object)) ||
           (options && options.forceObserve && (target = busybody.getObserver(busybody.makeObservable(object)))))
            return target.observe(property, callback, options);
        
        return false;
    };

    busybody.computed = function (object, property, callback, options) {
		///<summary>Create a computed which bind's to a property. The context of the callback will be the object.</summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The computed logic.</param>
		///<param name="options" type="Object" optional="true">See busybody.observeTypes.computed for options</param>
		///<returns type="busybody.observeTypes.computed">The computed</returns>
        
		return busybody.getObserver(busybody.makeObservable(object)).computed(property, callback, options);
    };

    busybody.observeArray = function (object, property, callback, options) {
		///<summary>Observe an array property of an object for changes</summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback</param>
		///<param name="options" type="Object" optional="true">See busybody.array.observe for options</param>
		///<returns type="busybody.disposable">A disposable</returns>
		
        busybody.makeObservable(object);
        return busybody.tryObserveArray(object, property, callback, options);
    };
    
    busybody.tryObserveArray = function (object, property, callback, options) {
		///<summary>Observe an array property of an object for changes if possible. If "object" is not observable, return</summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback</param>
		///<param name="options" type="Object" optional="true">See busybody.array.observe for options</param>
		///<returns type="busybody.disposable">A disposable</returns>
                
        var target = busybody.getObserver(object);
        
        if (target)
            return target.observeArray(property, callback, options);
        
        return false;
    };

	busybody.tryBindArrays = function (array1, array2, twoWay) {
		///<summary>Try to bind the values of 2 arrays together</summary>
		///<param name="array1" type="busybody.array">The first array</param>
		///<param name="array2" type="busybody.array">The second array</param>
		///<param name="twoWay" type="Boolean" optional="true">Bind the first array to the second array also</param>
		///<returns type="busybody.disposable">A disposable</returns>
		
		if ((!(array1 instanceof Array) && array1 != null) ||
		   (!(array2 instanceof Array) && array2 != null))
			throw "You cannot bind a value to an array. Arrays can only be bound to other arrays.";

		if (array1 == null && array2 == null)
			return;
		
		var output;
		if (array1 == null) {
			array2.length = 0;
		} else if (array2 != null) {
			if (array1 instanceof busybody.array)
				output = array1.bind(array2);
			else
				busybody.array.copyAll(array1, array2);
		}
		
		if (twoWay) {
			var op2 = busybody.tryBindArrays(array2, array1);
			if (op2) {
				if (output)
					output.registerDisposable(op2);
				else
					output = op2;
			}
		}
			
		return output;
	};
	
	var index = (function () {
		var i = 0;
		return function () {
			return "ch-" + (++i);
		};
	}());

	function createBindingEvaluator (object1, property1, object2, property2) {
		
		return function (changes) {
			
			var observer1 = busybody.getObserver(object1);
			if (changes && observer1.$bindingChanges)
				for (var i in observer1.$bindingChanges)
					if (object2 === observer1.$bindingChanges[i].fromObject
						&& changes[changes.length - 1] === observer1.$bindingChanges[i].change)
						return;
			
			busybody.captureChanges(object2, function () {
				busybody.utils.obj.setObject(property2, object2, busybody.utils.obj.getObject(property1, object1));
			}, function (changes) {
				var observer2 = busybody.makeObservable(object2);
				enumerateArr(changes, function (change) {
					
					var observer2 = busybody.getObserver(object2);
					if (observer2) {
						if (!observer2.$bindingChanges)
							observer2.$bindingChanges = {};

						var i = index();
						observer2.$bindingChanges[i] = {change: change, fromObject: object1};
						setTimeout(function () {
							delete observer2.$bindingChanges[i];
							for (var j in observer2.$bindingChanges)
								return;

							delete observer2.$bindingChanges;
						}, 100);
					}
				});
			});
		};
	}

	busybody.tryBind = function (object1, property1, object2, property2, twoWay, doNotSet) {
		///<summary>Try to bind the values of 2 properties together</summary>
		///<param name="object1" type="Object">The first object</param>
		///<param name="property1" type="String">The first property</param>
		///<param name="object2" type="Object">The second object</param>
		///<param name="property2" type="String">The second property</param>
		///<param name="twoWay" type="Boolean">Attempt to bind 2 ways</param>
		///<param name="doNotSet" type="Boolean">Do not set the value of the second property to the value of the first property</param>
		///<returns type="busybody.disposable">A disposable</returns>
		
		// store all parts which need to be disposed
		var disposable = new busybody.disposable();
				
		var dispKey, evaluator;
		function ev () {
			
			if (dispKey) {
				disposable.disposseOf(dispKey);
				disp = null;
			}
			
			var obj1 = busybody.utils.obj.getObject(property1, object1);
			var obj2 = busybody.utils.obj.getObject(property2, object2);
			
			// if arrays are invloved, bind arrays
			if (obj1 instanceof Array || obj2 instanceof Array) {
				dispKey = disposable.registerDisposable(busybody.tryBindArrays(obj1, obj2));
			} else {
				if (!doNotSet)
					(evaluator || (evaluator = createBindingEvaluator(object1, property1, object2, property2))).apply(this, arguments);
				else
					doNotSet = undefined;	// doNotSet is for first time only
			}
		}
		
		disposable.registerDisposable(busybody.tryObserve(object1, property1, ev, {useRawChanges: true}));
		
		ev();
		
		if (twoWay)
			disposable.registerDisposable(busybody.tryBind(object2, property2, object1, property1, false, true));
		
		return disposable;
	};
    
    busybody.bind = function (object1, property1, object2, property2, twoWay) {
		///<summary>Bind the values of 2 properties together</summary>
		///<param name="object1" type="Object">The first object</param>
		///<param name="property1" type="String">The first property</param>
		///<param name="object2" type="Object">The second object</param>
		///<param name="property2" type="String">The second property</param>
		///<param name="twoWay" type="Boolean">Attempt to bind 2 ways</param>
		///<returns type="busybody.disposable">A disposable</returns>
		
		busybody.makeObservable(object1);
		busybody.makeObservable(object2);
		
		return busybody.tryBind(object1, property1, object2, property2, twoWay);
    };

    busybody.isObserved = function (object) {
		///<summary>Determine if any callbacks are currently monitoring this observable</summary>
		///<param name="object" type="Object">The object</param>
		///<returns type="Boolean">The result</returns>
        
        var observer;
        return !!((observer = busybody.getObserver(object)) && observer.isObserved());
    }; 

    busybody.canObserve = function (object) {
		///<summary>Determine if an object can be observed. You can use busybody.makeObservable(...) to make objects observable</summary>
		///<param name="object" type="Object">The object</param>
		///<returns type="Boolean">The result</returns>
        
			//TODO: test array bit
        return object instanceof busybody.array || !!busybody.getObserver(object);
    }; 

    busybody.del = function (object, property) {
		///<summary>Delete a value from an observable</summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The value</param>
        
        var target = busybody.getObserver(object);
        
        if (target)
            return target.del(property);
		else
			delete target[property];
    };
    
    busybody.dispose = function (object) {
		///<summary>Dispose of an object which is observable</summary>
		///<param name="object" type="Object">The object</param>
		
        if (!busybody.tryRemoveObserver(object) && object instanceof busybody.disposable)
            object.dispose();
    };

    window.busybody = busybody;
}(window.orienteer));

}());