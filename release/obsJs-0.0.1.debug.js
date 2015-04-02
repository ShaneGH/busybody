// obsJs v0.0.1
// (c) Shane Connon 2015
// http://www.opensource.org/licenses/mit-license.php
// objJs v0.1.0
// (c) Shane Connon 2015
// http://www.opensource.org/licenses/mit-license.php
(function () {
    window.objjs = {};

var object = objjs.object = function object() {
	///<summary>The object class is the base class for all objects. It has base functionality for inheritance and parent methods</summary>
};

var cachedSuperMethods = {
	parents:[],
	children:[]
};

object.clearVirtualCache = function(forMethod /*optional*/) {
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
object.useVirtualCache = true;

object.prototype._super = function() {        
	///<summary>Call the current method or constructor of the parent class with arguments</summary>
	///<returns type="Any">Whatever the overridden method returns</returns>
	
	var currentFunction = arguments.callee.caller;
	
	// try to find a cached version to skip lookup of parent class method
	var cached = null;
	if(object.useVirtualCache) {
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
				if(object.useVirtualCache) {
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
object.extend = function (childClass) {
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
		if (this.hasOwnProperty(p) && this[p] && this[p].constructor === Function && this[p] !== object.clearVirtualCache && childClass.constructor[p] === undefined)
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

//TODO: test
//TODO: integrate into _super
object.getInheritanceChain = function(forClass) {
	var chain = [];
		
	while (forClass) {            
		chain.push(forClass);
		forClass = Object.getPrototypeOf(forClass.prototype);
		if(forClass)
			forClass = forClass.constructor
	}
	
	return chain;
};

}());

(function () {
    window.obsjs = {};
    var useObjectObserve = obsjs.useObjectObserve = Object.observe && (!window.hasOwnProperty("useObjectObserve") || window.useObjectObserve);

    
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
    ///<summary>Create an obsjs class</summary>
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
    ///<summary>Similar to $.extend but with a namespace string which must begin with "obsjs"</summary>
    ///<param name="namespace" type="String">The namespace to add to</param>
    ///<param name="extendWith" type="Object">The object to add to the namespace</param>
    
    namespace = namespace.split(".");
    
    if(namespace[0] !== "obsjs") throw "Root must be \"obsjs\".";
    namespace.splice(0, 1);
    
    var current = obsjs;
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

Class("obsjs.utils.obj", function () {
        
    var arrayMatch = /\[\s*\d\s*\]$/g;
    var splitPropertyName = function(propertyName) {
        propertyName = propertyName.split(".");
        
        var tmp;
        for (var i = 0; i < propertyName.length; i++) {
            propertyName[i] = obsjs.utils.obj.trim(propertyName[i]);
            var match = propertyName[i].match(arrayMatch);
            if (match && match.length) {
                if (tmp = obsjs.utils.obj.trim(propertyName[i].replace(arrayMatch, ""))) {
                    propertyName[i] = obsjs.utils.obj.trim(propertyName[i].replace(arrayMatch, ""));
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
    
    function _getObject(splitPropertyName, context) {
        ///<summary>Get an object from string</summary>
        ///<param name="splitPropertyName" type="Array">The property name split into parts, including numbers for array parts</param>
        ///<param name="context" type="Any" optional="true">The root context. Defaults to window</param>
        ///<returns type="Any">The object</returns>
        if(!context) context = window;
        
        for (var i = 0, ii = splitPropertyName.length; i <ii; i++) {
            context = context[splitPropertyName[i]];
            if(context == null)
                return i === ii - 1 ? context : null;
        }
        
        return context;
    };
    
    var setObject = function(propertyName, context, value) {
        propertyName = splitPropertyName(propertyName);
        if (propertyName.length > 1)
            context = _getObject(propertyName.splice(0, propertyName.length -1), context);
        
        context[propertyName[0]] = value;
    };	

    function addWithDispose(callbackArray, callback) {

        callbackArray.push(callback);
        var dispose = new obsjs.disposable(function () {
            if (!dispose) return;
            dispose = null;

            callback = callbackArray.indexOf(callback);
            if (callback !== -1)
                callbackArray.splice(callback, 1);
        });

        return dispose;
    }
    
	function createBindFunction (bindToObject, bindToProperty, parser) {
        var arrayDisposeCallback;
        var output = function (oldValue, newValue) {
            
            if (parser) newValue = parser(newValue);
            
            var existingVal = obsjs.utils.obj.getObject(bindToProperty, bindToObject);
            if (newValue === existingVal)
                return;
            
            output.dispose();

			if (obsjs.observeTypes.computed.isArray(existingVal) && newValue == null) {
				existingVal.length = 0;
			} else if (!obsjs.observeTypes.computed.isArray(newValue) || !obsjs.observeTypes.computed.isArray(existingVal)) {
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
    
    var obj = function obj() { };
    obj.trim = trim;
	obj.createBindFunction = createBindFunction;
    obj.addWithDispose = addWithDispose;
    obj.enumerateArr = enumerateArr;
    obj.enumerateObj = enumerateObj;
    obj.getObject = getObject;
    obj.setObject = setObject;
    obj.splitPropertyName = splitPropertyName;
    obj.joinPropertyName = joinPropertyName;
    
    return obj;
});


Class("obsjs.disposable", function () {
    
	function init (disp) {
		if (!disp.$disposables) disp.$disposables = {};
	}
	
    var disposable = objjs.object.extend(function disposable(disposableOrDisposeFunction) {
        ///<summary>An object which can be disposed</summary>
        
        this._super();
        
        if (!disposableOrDisposeFunction)
            ;
        else if (disposableOrDisposeFunction instanceof Function)
            this.registerDisposeCallback(disposableOrDisposeFunction);
        else
            this.registerDispose(disposableOrDisposeFunction);
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
        
        if(!disposableOrDisposableGetter) throw "Invalid disposeable object";        
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

Class("obsjs.utils.executeCallbacks", function () {
	
	var executeCallbacks = obsjs.disposable.extend(function executeCallbacks() {
		if (this.constructor === executeCallbacks) throw "You cannot create an instance of an abstract class";
		
		this._super();
		
		this.callbacks = [];
	});
	
	executeCallbacks.prototype.addCallback = function (callback) {
		var op = obsjs.utils.obj.addWithDispose(this.callbacks, callback);
		this.registerDisposable(op);
		
		return op;
	};
        
    executeCallbacks.prototype._execute = function() {
		throw "Abstract methods must be implemented";
		// returns { cancel: true | false, arguments: [] }
	};
	
    executeCallbacks.prototype.execute = function() {
		var args = this._execute();
		
		if (args && !args.cancel)
			enumerateArr(this.callbacks.slice(), function (cb) {
				cb.apply(null, args.arguments || []);
			});
    };
    
    executeCallbacks.prototype.dispose = function () {
		this._super();
		
		// clear __executePending timeout?
		
		this.callbacks.length = 0;
    };
	
	return executeCallbacks;
});


Class("obsjs.observeTypes.observeTypesBase", function () {
	
	var observeTypesBase = obsjs.utils.executeCallbacks.extend(function observeTypesBase() {
		if (this.constructor === observeTypesBase) throw "You cannot create an instance of an abstract class";
		
		this._super();
	});
      
    observeTypesBase.prototype.getValue = function() {
		throw "Abstract methods must be implemented";
	};
        
    observeTypesBase.prototype._execute = function() {
		var oldVal = this.val;
		this.val = this.getValue();
		
		return {
			cancel: this.val === oldVal,
			arguments: [oldVal, this.val]
		};
    };
	
	return observeTypesBase;
});


Class("obsjs.observableBase", function () {
        
    var observableBase = obsjs.disposable.extend(function observableBase(forObject) {
        ///<summary>An object whose properties can be subscribed to</summary>

        this._super();

        this.$changeBatch = [];
        this.$forObject = forObject;
        this.$callbacks = {};
    });
    
	// this function is also used by arrayBase
    observableBase.prototype.registerChangeBatch = function (changes) {
        if (!this.$changeBatch.length)
            setTimeout(this.processChangeBatch.bind(this));
        
        this.$changeBatch.push.apply(this.$changeBatch, changes);
    };
    
    observableBase.prototype.processChangeBatch = function () {
        var splitChanges = {};
        enumerateArr(this.$changeBatch, function(change) {
            if (!splitChanges[change.name])
                splitChanges[change.name] = [];

            splitChanges[change.name].push(change);
        });
        
        this.$changeBatch.length = 0;

        obsjs.utils.observeCycleHandler.instance.execute(this.$forObject || this, (function () {
			var evaluateMultiple = [];
			enumerateObj(splitChanges, function (changes, name) {
				if (this.$callbacks[name])
					evaluateMultiple.push.apply(evaluateMultiple, observableBase.processChanges(this.$callbacks[name], changes));
			}, this);

			enumerateArr(evaluateMultiple, function (c) { c(); });
		}).bind(this));
    };

    observableBase.processChanges = function (callbacks, changes) {
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
        throw "Abstract methods must be overridden";
    };
    
    observableBase.prototype.captureChanges = function (logic, callback) {
        throw "Abstract methods must be overridden";
    };

    observableBase.prototype.observeArray = function (property, callback, context, options) {
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
                callback.call(context, change);
            } else {
                var cec = new obsjs.utils.compiledArrayChange([change], 0, 1);
                callback.call(context, cec.getRemoved(), cec.getAdded(), cec.getIndexes());
            }
            
            if (newValue instanceof obsjs.array)
                d2 = this.registerDisposable(newValue.observe(callback, context, options));
        }, this);
        
        var tmp;
        if ((tmp = obsjs.utils.obj.getObject(property, this.$forObject || this)) instanceof obsjs.array)
            d2 = this.registerDisposable(tmp.observe(callback, context, options));
        
        return new obsjs.disposable(function () {
            if (d2) {
                this.disposeOf(d2);
                d2 = null;
            }
            
            if (d1) {
                d1.dispose();
                d1 = null;
            }
        });
    }

    observableBase.prototype.observe = function (property, callback, context, options) {
        
		// options: evaluateOnEachChange, evaluateIfValueHasNotChanged
		
        if (/[\.\[]/.test(property)) {
            var pw = new obsjs.observeTypes.pathObserver(this.$forObject || this, property, callback, context);
            this.registerDisposable(pw);
            return pw;
        }
        
        this._init(property);

        var cb = new obsjs.callbacks.propertyCallback(callback, context, options);
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
        throw "Abstract methods must be implemented";
    };

    observableBase.prototype.dispose = function () {
        this._super();
        
        delete this.$forObject;
        for (var i in this.$callbacks)
            delete this.$callbacks[i];
    };
    
    observableBase.prototype.computed = function (property, callback, options) {
        
        var computed = new obsjs.observeTypes.computed(callback, this, options);
        computed.bind(this.$forObject || this, property);
        this.registerDisposable(computed);
        return computed;        
    };
    
    observableBase.prototype.del = function (property) {
        
        delete (this.$forObject || this)[property];
    };
        
    observableBase.afterObserveCycle = function(callback) {
        return obsjs.utils.observeCycleHandler.instance.afterObserveCycle(callback);
    };

    observableBase.beforeObserveCycle = function(callback) {
        return obsjs.utils.observeCycleHandler.instance.beforeObserveCycle(callback);
    };

    observableBase.afterNextObserveCycle = function (callback, waitForNextCycleToStart) {

        if (obsjs.utils.observeCycleHandler.instance.length === 0 && !waitForNextCycleToStart) {
            callback();
            return;
        }

        var dispose = obsjs.utils.observeCycleHandler.instance.afterObserveCycle(function () {
            dispose.dispose();
            callback();
        });

        return dispose;
    };

    observableBase.beforeNextObserveCycle = function (callback) {

        var dispose = obsjs.utils.observeCycleHandler.instance.beforeObserveCycle(function () {
            dispose.dispose();
            callback();
        });

        return dispose;
    };
    
    return observableBase;
});


Class("obsjs.callbacks.changeCallback", function () {
        
    var changeCallback = objjs.object.extend(function changeCallback(evaluateOnEachChange) {
        this._super();
        
        this.evaluateOnEachChange = evaluateOnEachChange;
    });
    
    // remove this callback flag
    changeCallback.dispose = {};
    
    changeCallback.prototype.activate = function (activatingChange) {
        if (this._activated || this._activatingChange)
            throw "This callback has been activated";
        
		if (arguments.length)
        	this._activatingChange = activatingChange;
		else
			this._activated = true;
    };
    
    changeCallback.prototype.deactivate = function (deactivatingChange) {
        if (this._deactivatingChange)
            throw "This callback has a deactivate pending";
        
        if (arguments.length)
            this._deactivatingChange = deactivatingChange;
        else 
            this._activated = false;
    };

    changeCallback.prototype.evaluateSingle = function (changes, changeIndex) {
        
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
        throw "Abstract methods must be implemented";
    };

    changeCallback.prototype.evaluateMultiple = function (changes) {
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
    
    changeCallback.prototype._evaluateMultiple = function (changes) {
        throw "Abstract methods must be implemented";
    };
    
    return changeCallback;
});

Class("obsjs.arrayBase", function () {
        
    var arrayBase = objjs.object.extend.call(Array, function arrayBase (initialValues) {
        
        Array.call(this);
        
        if (arguments.length)
            if (!(arguments[0] instanceof Array))
                throw "The initial values must be an array";
        
        this.$disposables = [];
        this.$boundArrays = [];
        this.$callbacks = [];
        this.$changeBatch = [];
        this.$length = initialValues ? initialValues.length : 0;    
        
        if (initialValues)
            for(var i = 0, ii = initialValues.length; i < ii; i++)
                this[i] = initialValues[i]; // doing it this way as it will not publish changes
    });
    
    arrayBase.prototype._super = objjs.object.prototype._super;
    arrayBase.extend = objjs.object.extend;
    
    arrayBase.isValidArrayChange = function (change) {
        return change.type === "splice" || !isNaN(parseInt(change.name));
    };
    
    arrayBase.prototype.captureChanges = function (logic, callback) {
        throw "Abstract methods must be overridden";
    };
         
    arrayBase.prototype.onNextArrayChange = function (callback) {
        
        throw "Abstract methods must be implemented";
    };
         
    arrayBase.prototype.processChangeBatch = function () {
        
        var changeBatch = this.$changeBatch.slice();
        this.$changeBatch.length = 0;

        obsjs.utils.observeCycleHandler.instance.execute(this, (function () {
        	enumerateArr(obsjs.observableBase.processChanges(this.$callbacks, changeBatch), function (c) { c(); });
		}).bind(this));
    };
    
    arrayBase.prototype.registerChangeBatch = function (changes) {
        
        // not interested in property changes
        for (var i = changes.length - 1; i >= 0; i--)
            if (!arrayBase.isValidArrayChange(changes[i]))
                changes.splice(i, 1);
        
        return obsjs.observableBase.prototype.registerChangeBatch.call(this, changes);
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
        throw "Abstract methods must be implemented";
    };
    
    arrayBase.prototype.observe = function (callback, context, options) {
        // options evaluateOnEachChange and useRawChanges
		
        if (typeof arguments[0] === "string") {			
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 0, this);
            return obsjs.observe.apply(null, args);
        }
		
		return this.addCallback(new obsjs.callbacks.arrayCallback(callback, context, options));
    };
	
	arrayBase.prototype.disposableFor = function (changeCallback) {
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
    
	var boundArrayStopKey = "obsjs-do-not-apply-to";
    arrayBase.prototype.alteringArray = function(method, args) {
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
        
        if (!anotherArray || this.$boundArrays.indexOf(anotherArray) !== -1) return;
		
		this.$boundArrays.push(anotherArray);
        
        if (!(anotherArray instanceof obsjs.array) || anotherArray.$boundArrays.indexOf(this) === -1)
            arrayBase.copyAll(this, anotherArray);
		
		return new obsjs.disposable((function () {
			if (!anotherArray) return;
			var i;
			if ((i = this.$boundArrays.indexOf(anotherArray)) !== -1)
				this.$boundArrays.splice(i, 1);
			
			anotherArray = null;
		}).bind(this));
    };
	
	arrayBase.prototype.addCallback = function (callback) {
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
Class("obsjs.array", function () {
    
    var array = obsjs.arrayBase.extend(function array (initialValues) {
        
        this._super.apply(this, arguments);
    });
         
    array.prototype.onNextArrayChange = function (callback) {

        var cb = (function (changes) {
            if (!cb) return;
            for (var i = 0, ii = changes.length; i < ii; i++) {
                if (obsjs.arrayBase.isValidArrayChange(changes[i])) {    
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
        
        var cb = function (changes) {
            changes = changes.slice();
            for (var i = changes.length - 1; i >= 0; i--)
                if (!obsjs.arrayBase.isValidArrayChange(changes[i]))
                    changes.splice(i, 1);

            callback(changes);
        };
        
        Array.observe(this, cb);
        logic();
        Array.unobserve(this, cb);
    };

    array.prototype._init = function () {
        if (this.__subscription) return;
        
        this.__subscription = this.registerChangeBatch.bind(this);
        Array.observe(this, this.__subscription);
    };
    
    array.prototype.dispose = function () {
        this._super();        
        
        if (this.__subscription) {
            Array.unobserve(this, this.__subscription);
            delete this.__subscription;
        }
    };
    
    return array;
}) :
Class("obsjs.array", function () {
    
    var array = obsjs.arrayBase.extend(function array (initialValues) {
        
        this._super.apply(this, arguments);
        
        this.$onNextArrayChanges = [];
        this.$captureCallbacks = [];
    }); 
    
    array.prototype.captureArrayChanges = function (logic, callback) {
        
        var cb = function (changes) {
            changes = changes.slice();
            for (var i = changes.length - 1; i >= 0; i--)
                if (!obsjs.arrayBase.isValidArrayChange(changes[i]))
                    changes.splice(i, 1);

            callback(changes);
        };
        
        this.$captureCallbacks.push(cb);
        logic();
        this.$captureCallbacks.splice(this.$captureCallbacks.indexOf(cb), 1);
    };
    
    array.prototype.registerChangeBatch = function (changes) {
        for (var i = 0, ii = changes.length; i < ii; i++) {
            if (obsjs.arrayBase.isValidArrayChange(changes[i])) {
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

        this.$onNextArrayChanges.push(callback);
    };

    array.prototype._init = function () {
        // unneeded
    };
    
    return array;
});

(function () {
    
    var array = obsjs.array;
    
    array.prototype.replace = function(index, replacement) {        
        this.splice(index, index >= this.length ? 0 : 1, replacement);
        return replacement;
    };

    array.prototype.pop = function() {

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

        var i;
        if ((i = this.indexOf(item)) !== -1)
            this.splice(i, 1);
    };

    array.prototype.push = function() {

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

    array.prototype.reverse = function(item) {

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

    array.prototype.sort = function() {
		
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


Class("obsjs.callbacks.arrayCallback", function () {
        
    var arrayCallback = obsjs.callbacks.changeCallback.extend(function arrayCallback(callback, context, options) {
        
        this._super(options && options.evaluateOnEachChange);
        
		this.useRawChanges = options && options.useRawChanges;
        this.callback = callback;
        this.context = context;
    });

    arrayCallback.prototype._evaluateSingle = function (changes, index) {

        this.callback.call(this.context, changes[index]);
    };

    arrayCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
		
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
            changes.compiled.push(result = new obsjs.utils.compiledArrayChange(changes, beginAt, endAt));
        
        this._evaluateArrayMultiple(result);
    };

    arrayCallback.prototype._evaluateArrayMultiple = function (result) {
        
        this.callback.call(this.context, result.getRemoved(), result.getAdded(), result.getIndexes());
    };
    
    return arrayCallback;
});


Class("obsjs.callbacks.propertyCallback", function () {
        
    var propertyCallback = obsjs.callbacks.changeCallback.extend(function propertyCallback(callback, context, options) {
        
		// options: evaluateOnEachChange, evaluateIfValueHasNotChanged
		
        this._super(options && options.evaluateOnEachChange);
        
        this.callback = callback;
        this.context = context;
        this.evaluateIfValueHasNotChanged = options && options.evaluateIfValueHasNotChanged;
    });

    propertyCallback.prototype._evaluateSingle = function (changes, index) {

        var change = changes[index], 
            nextChange = changes[index + 1], 
            newVal = nextChange ? nextChange.oldValue : change.object[change.name];
        
        if (this.evaluateIfValueHasNotChanged || newVal !== change.oldValue)
            this.callback.call(this.context, change.oldValue, newVal);
    };

    propertyCallback.prototype._evaluateMultiple = function (changes, beginAt, endAt) {
		
		var newVal = changes[endAt] ? changes[endAt].oldValue : changes[0].object[changes[0].name];
        if (this.evaluateIfValueHasNotChanged || newVal !== changes[beginAt].oldValue)
            this.callback.call(this.context, changes[beginAt].oldValue, newVal);
    };
    
    return propertyCallback;
});

    
var observable = useObjectObserve ?
    Class("obsjs.observable", function () {
        var observable = obsjs.observableBase.extend(function observable(forObject) {
            this._super(forObject);
        });

        observable.prototype.onNextPropertyChange = function (property, callback) {

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

        observable.prototype.captureChanges = function (logic, callback) {

            // make unique callback
            var cb = function () { callback.apply(this, arguments) };
            Object.observe(this.$forObject || this, cb);
            logic();
            Object.unobserve(this.$forObject || this, cb);
        };

        observable.prototype._init = function () {
            if (this.__subscribeCallback) return;

            this.__subscribeCallback = this.registerChangeBatch.bind(this);
            Object.observe(this.$forObject || this, this.__subscribeCallback);
        };

        observable.prototype.dispose = function () {
            this._super();

            if (this.__subscribeCallback) {
                Object.unobserve(this.$forObject || this, this.__subscribeCallback);
                delete this.__subscribeCallback;
            }
        };

        return observable;
    }) :
    Class("obsjs.observable", function () {
        var observable = obsjs.observableBase.extend(function observable(forObject) {
            this._super(forObject);

            this.$observed = {};
            this.$onNextPropertyChanges = {};
            this.$captureCallbacks = [];
        });

        observable.prototype.onNextPropertyChange = function (property, callback) {

            (this.$onNextPropertyChanges[property] || (this.$onNextPropertyChanges[property] = [])).push(callback);
        };

        observable.prototype.captureChanges = function (logic, callback) {

            // make unique callback
            var cb = function () { callback.apply(this, arguments) };
            this.$captureCallbacks.push(cb);
            logic();
            this.$captureCallbacks.splice(this.$captureCallbacks.indexOf(cb), 1);
        };

        function getObserver(forObject) { return forObject.$observer || forObject; }
        observable.prototype._init = function (forProperty) {

            if (this.$observed.hasOwnProperty(forProperty)) return;

            if ((this.$forObject || this).hasOwnProperty(forProperty))
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

            (this.$forObject || this)[property] = undefined;
            this._super(property);
        }

        observable.prototype.dispose = function () {
            this._super();
            for (var i in this.$onNextPropertyChanges)
                delete this.$onNextPropertyChanges[i];
        };

        return observable;
    });

// name is subject to change

//TODO: look into esprima and falafel

Class("obsjs.observeTypes.computed", function () {
    
    var WITH = /\s*with\s*\(/g;
    var GET_ARGUMENT_NAMES = /([^\s,]+)/g;
    var STRIP_INLINE_COMMENTS = /\/\/.*$/mg;  
    var STRIP_BLOCK_COMMENTS = /\/\*[\s\S]*?\*\//mg;
    var GET_ITEMS = "((\\s*\\.\\s*([\\w\\$]*))|(\\s*\\[\\s*\\d\\s*\\]))+"; // ".propertyName" -or- "[2]"
    var completeArg = {};
	
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
		///<summary>Re-subscribe to all possible arrays</summary>
		
		enumerateArr(this.possibleArrays, function (possibleArray) {
			if (possibleArray.disposeKeys && possibleArray.disposeKeys.length) {
				this.disposeOf(possibleArray.disposeKeys);
				possibleArray.disposeKeys.length = 0;
			}	
			
			var array = possibleArray.path.length ? 
				obsjs.utils.obj.getObject(possibleArray.path, possibleArray.root) : 
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
    
    computed.prototype.examineVariable = function(variableName, complexExamination) {
		///<summary>Find all property paths of a given variable<summary>
		///<param name="variableName" type="String">The variable name<param>
		///<param name="complexExamination" type="Boolean">If set to true, the result will include the indexes of the property path as well as the actual text of the property paths<param>
		
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
            tmp = obsjs.utils.obj.splitPropertyName(item.variableName);
			if (tmp.length > 1)
				this.addPathWatchFor(variable, obsjs.utils.obj.joinPropertyName(tmp.slice(1)));
			
			// if we are looking for array elements, do more examination for this
			if (observeArrayElements) {
				var possibleArray;
				enumerateArr(item.complexResults, function (found) {
					if (arrProps = this.examineArrayProperties(found.name, found.index)) {
						if (!possibleArray)
							this.possibleArrays.push(possibleArray = {
								root: variable,
								path: obsjs.utils.obj.joinPropertyName(tmp.slice(1)),
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
		var path = new obsjs.observeTypes.pathObserver(variable, path, this.execute, this);
		
		var dispose;
		var te = this.execute.bind(this);
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

// name is subject to change

Class("obsjs.observeTypes.pathObserver", function () {
        
    var pathObserver = obsjs.observeTypes.observeTypesBase.extend(function pathObserver (forObject, property, callback, context) {
        ///<summary>Observe a property for change. Should be "call()"ed with this being a "watched"</summary>
        ///<param name="forObject" type="obsjs.observable" optional="false">The object to watch</param>
        ///<param name="property" type="String" optional="false">The property</param>
        ///<param name="callback" type="Function" optional="true">A callback for property change</param>
        ///<param name="context" type="Any" optional="true">The context of the callback</param>
		
        this._super();
        
        this.forObject = forObject;
        this.property = property;
        
        this.path = obsjs.utils.obj.splitPropertyName(property);
        
        this.__pathDisposables = new Array(this.path.length);
        this.execute();
        
        this.buildObservableChain();
        this.init = true;
		
		this.callbacks = [];
		if (callback)
			this.onValueChanged(callback.bind(context || forObject), false);
    });
    
    pathObserver.prototype.onValueChanged = function (callback, evaluateImmediately) {
              
		var output = this.addCallback(callback);		
        if (evaluateImmediately)
            callback(undefined, this.val);
		
        return output;
    };
    
    pathObserver.prototype.buildObservableChain = function (begin) {
        begin = begin || 0;
        
        // dispose of anything in the path after the change
        for (var i = begin; i < this.path.length; i++) {
            if (this.__pathDisposables[i]) {
                this.__pathDisposables[i].dispose();
                this.__pathDisposables[i] = null;
            }
        }

        var current = this.forObject, _this = this;
        
        // get item at index "begin"
        for (i = 0; current && i < begin; i++) {
            current = current[this.path[i]];
        }
        
        // get the last item in the path subscribing to changes along the way
        for (; current && i < this.path.length - 1; i++) {
            if ((obsjs.canObserve(current) || current instanceof obsjs.array) && current[this.path[i]] && i >= begin) {
                
                var args = [current, (function (i) {
                    return function(oldVal, newVal) {
                        _this.buildObservableChain(i);
						_this.execute();
                    };
                }(i))];
                
                if (isNaN(this.path[i])) {
                    args.splice(1, 0, this.path[i]);
                }
                
                this.__pathDisposables[i] = obsjs.tryObserve.apply(null, args);
            }

            current = current[this.path[i]];
        }
        
        // observe last item in path
        if (obsjs.canObserve(current))
            this.__pathDisposables[i] = obsjs.tryObserve(current, this.path[i], function (oldVal, newVal) {
                this.execute();
            }, this);
    };
        
    pathObserver.prototype.getValue = function() {
        var current = this.forObject;
        
        // get item at index "begin"
        for (var i = 0, ii = this.path.length; current != null && i < ii; i++) {
            current = current[this.path[i]];
        }
		
		return i === ii ? current : null;
    };
	
    pathObserver.prototype.dispose = function () {
        this._super();
        
        for (var i = 0, ii = this.__pathDisposables.length; i < ii && this.__pathDisposables[i]; i++)
            if (this.__pathDisposables[i])
                this.__pathDisposables[i].dispose();

        this.__pathDisposables.length = 0;
    };
                                      
    return pathObserver;
});

// name is subject to change

Class("obsjs.utils.compiledArrayChange", function () {
    
    function compiledArrayChange(changes, beginAt, endAt) {
        this.beginAt = beginAt;
        this.endAt = endAt;
        this.changes = [];
        
        this.build(changes);
    }
    
    compiledArrayChange.prototype.buildIndexes = function () {
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
        return this.beginAt === beginAt && this.endAt === endAt;
    };
    
    compiledArrayChange.prototype.getRemoved = function () {
        return this.removed.slice();
    };
    
    compiledArrayChange.prototype.getAdded = function () {
        return this.added.slice();
    };
    
    compiledArrayChange.prototype.getIndexes = function () {
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
Class("obsjs.utils.observeCycleHandler", function () {
        
    var observeCycleHandler = obsjs.observable.extend(function observeCycleHandler () {
        this._super();
        
        this.$afterObserveCycles = [];
        this.$beforeObserveCycles = [];
        this.length = 0;
        
        this.observe("length", function (oldVal, newVal) {
            if (newVal === 0)
                enumerateArr(this.$afterObserveCycles.slice(), ex);
        }, this, {
			evaluateOnEachChange: false, 
			evaluateIfValueHasNotChanged: true
		});
    });
	
    observeCycleHandler.prototype.execute = function (forObject, executionLogic) {
		
		try {
			this.before(forObject);
			executionLogic();
		} finally {
        	this.after(forObject);
		}
	};

    function ex(callback) { callback(); }
    observeCycleHandler.prototype.before = function (forObject) {
        if (forObject === this) return;
        
        if (this.length === 0)
            enumerateArr(this.$beforeObserveCycles.slice(), ex);
            
        this.length++;
    };
    
    observeCycleHandler.prototype.clear = function () {
        if (this.length > 0) this.length = 0;
    };

    observeCycleHandler.prototype.after = function (forObject) {
        if (forObject === this || this.length <= 0) return;
        
        this.length--;
    };

    observeCycleHandler.prototype.afterObserveCycle = function (callback) {

        return obsjs.utils.obj.addWithDispose(this.$afterObserveCycles, callback);
    };

    observeCycleHandler.prototype.befreObserveCycle = function (callback) {

        return obsjs.utils.obj.addWithDispose(this.$beforeObserveCycles, callback);
    };

    observeCycleHandler.prototype.dispose = function () {

		this._super();
		
        this.$afterObserveCycles.length = 0;
        this.$beforeObserveCycles.length = 0;
    };
    
    observeCycleHandler.instance = new observeCycleHandler();
    
    return observeCycleHandler;
});

    
    obsjs.getObserver = function (object) {
                
        return object == null || object instanceof obsjs.observableBase ?
            object :
            (object.$observer instanceof obsjs.observableBase ? object.$observer : null);
    };
    
    obsjs._captureChanges = function (forObject, logic, callback, captureType) {
                
        captureType.observe(forObject, callback);
        logic();
        captureType.unobserve(forObject, callback);
    };
    
    obsjs.captureArrayChanges = function (forObject, logic, callback) {
        if (!(forObject instanceof obsjs.array))
            throw "Only obsjs.array objects can have changes captured";
        
        return forObject.captureArrayChanges(logic, callback);
    };
    
    obsjs.captureChanges = function (forObject, logic, callback) {
        obsjs.makeObservable(forObject);
        var target = obsjs.getObserver(forObject);
        
        return target.captureChanges(logic, callback);
    };

    obsjs.makeObservable = function (object) {
        if (!arguments.length)
            object = {};
        
		if (object instanceof obsjs.array) {
			if (obsjs.getObserver(object)) 
				return object;
		} else if (obsjs.canObserve(object)) {
			return object;
		}
        
        if (object.$observer) throw "The $observer property is reserved";

        Object.defineProperty(object, "$observer", {
            enumerable: false,
            configurable: false,
            value: new obsjs.observable(object),
            writable: false
        });
        
        return object;
    };

    obsjs.observe = function (object, property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged) {
        obsjs.makeObservable(object);
        return obsjs.tryObserve(object, property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged);
    };

    obsjs.tryObserve = function (object, property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged) {
        
        if (object instanceof obsjs.array) {
			if (property instanceof Function)
            	return object.observe(arguments[1], arguments[2], arguments[3]);    // property names are misleading in this case
			if (property === "length")
				property = "$length";
			
			obsjs.makeObservable(object);	//TODO: test
		}
        
        var target = obsjs.getObserver(object);
        
        if (target)
            return target.observe(property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged);
        
        return false;
    };

    obsjs.observeArray = function (object, property, callback, context, evaluateOnEachChange) {
        obsjs.makeObservable(object);
        return obsjs.tryObserveArray(object, property, callback, context, evaluateOnEachChange);
    };
    
    obsjs.tryObserveArray = function (object, property, callback, context, evaluateOnEachChange) {
                
        var target = obsjs.getObserver(object);
        
        if (target)
            return target.observeArray(property, callback, context, evaluateOnEachChange);
        
        return false;
    };

    obsjs.canObserve = function (object) {
        
			//TODO: test array bit
        return object instanceof obsjs.array || !!obsjs.getObserver(object);
    };

    obsjs.del = function (object, property) {
        
        var target = obsjs.getObserver(object);
        
        if (target)
            return target.del(property);
    };
    
    obsjs.dispose = function (object) {
        var target = obsjs.getObserver(object);
        
        if (target)
            return target.dispose();
    };
}());