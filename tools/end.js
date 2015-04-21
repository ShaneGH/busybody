    
    busybody.getObserver = function (object) {
		///<summary>Get the observer for an object, if any. The object's observer might be iself</summary>
		///<param name="object" type="Object">The object</param>
		///<returns type="busybody.observable">The observer</returns>
                
        return object == null || object instanceof busybody.observableBase ?
            object :
            (object.$observer instanceof busybody.observableBase ? object.$observer : null);
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
		///<param name="property" type="String">The property</param>
		
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
        
		if (object instanceof busybody.array) {
			if (busybody.getObserver(object)) 
				return object;
		} else if (busybody.canObserve(object)) {
			return object;
		}
        
        if (object.$observer) throw "The $observer property is reserved";

        Object.defineProperty(object, "$observer", {
            enumerable: false,
            configurable: false,
            value: new busybody.observable(object),
            writable: false
        });
        
        return object;
    };

    busybody.observe = function (object, property, callback, context, options) {
		///<summary>Observe changes to a property </summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback to execute</param>
		///<param name="context" type="Any" optional="true">The "this" in the callback</param>
		///<param name="options" type="Object" optional="true">See busybody.observable.observe for options</param>
		
        busybody.makeObservable(object);
        return busybody.tryObserve(object, property, callback, context, options);
    };

    busybody.tryObserve = function (object, property, callback, context, options) {
		///<summary>Observe changes to a property if possible. If "object" is not observable, return</summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback to execute</param>
		///<param name="context" type="Any" optional="true">The "this" in the callback</param>
		///<param name="options" type="Object" optional="true">See busybody.observable.observe for options</param>
        
        if (object instanceof busybody.array) {
			if (property instanceof Function)
            	return object.observe(arguments[1], arguments[2], arguments[3]);    // property names are misleading in this case
			if (property === "length")
				property = "$length";
			
			busybody.makeObservable(object);	//TODO: test
		}
        
        var target = busybody.getObserver(object);
        
        if (target)
            return target.observe(property, callback, context, options);
        
        return false;
    };

    busybody.computed = function (object, property, callback, options) {
		///<summary>Create a computed which bind's to a property. The context of the callback will be the object.</summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The computed logic.</param>
		///<param name="options" type="Object" optional="true">See busybody.observeTypes.computed for options</param>
		///<returns type="busybody.observeTypes.computed">The computed</param>
        
		return busybody.getObserver(busybody.makeObservable(object)).computed(property, callback, options);
    };

    busybody.observeArray = function (object, property, callback, context, options) {
		///<summary>Observe an array property of an object for changes</summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback</param>
		///<param name="context" type="Any">The "this" value in the callback</param>
		///<param name="options" type="Object" optional="true">See busybody.array.observe for options</param>
		///<returns type="busybody.disposable">A disposable</returns>
		
        busybody.makeObservable(object);
        return busybody.tryObserveArray(object, property, callback, context, options);
    };
    
    busybody.tryObserveArray = function (object, property, callback, context, options) {
		///<summary>Observe an array property of an object for changes if possible. If "object" is not observable, return</summary>
		///<param name="object" type="Object">The object</param>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback</param>
		///<param name="context" type="Any">The "this" value in the callback</param>
		///<param name="options" type="Object" optional="true">See busybody.array.observe for options</param>
		///<returns type="busybody.disposable">A disposable</returns>
                
        var target = busybody.getObserver(object);
        
        if (target)
            return target.observeArray(property, callback, context, options);
        
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
		
		disposable.registerDisposable(busybody.tryObserve(object1, property1, ev, null, {useRawChanges: true}));
		
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
		
        var target = busybody.getObserver(object);
        
        if (target)
            return target.dispose();
    };

    window.busybody = busybody;
}(window.orienteer));