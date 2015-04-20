    
    busybody.getObserver = function (object) {
                
        return object == null || object instanceof busybody.observableBase ?
            object :
            (object.$observer instanceof busybody.observableBase ? object.$observer : null);
    };
    
    busybody.captureArrayChanges = function (forObject, logic, callback) {
        if (!(forObject instanceof busybody.array))
            throw "Only busybody.array objects can have changes captured";
        
        return forObject.captureArrayChanges(logic, callback);
    };
    
    busybody.captureChanges = function (forObject, logic, callback, property) {
        forObject = busybody.getObserver(forObject);
        
		if (forObject)
        	return forObject.captureChanges(logic, callback, property);
		else
			logic();
    };

    busybody.makeObservable = function (object) {
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

    busybody.observe = function (object, property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged) {
        busybody.makeObservable(object);
        return busybody.tryObserve(object, property, callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged);
    };

    busybody.tryObserve = function (object, property, callback, context, options) {
        
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

    busybody.observeArray = function (object, property, callback, context, evaluateOnEachChange) {
        busybody.makeObservable(object);
        return busybody.tryObserveArray(object, property, callback, context, evaluateOnEachChange);
    };
    
    busybody.tryObserveArray = function (object, property, callback, context, evaluateOnEachChange) {
                
        var target = busybody.getObserver(object);
        
        if (target)
            return target.observeArray(property, callback, context, evaluateOnEachChange);
        
        return false;
    };

	busybody.tryBindArrays = function (array1, array2) {
		
		if ((!(array1 instanceof Array) && array1 != null) ||
		   (!(array2 instanceof Array) && array2 != null))
			throw "You cannot bind a value to an array. Arrays can only be bound to other arrays.";

		if (array1 == null && array2 == null)
			return;
		
		if (array1 == null) {
			array2.length = 0;
		} else if (array2 != null) {
			if (array1 instanceof busybody.array)
				return array1.bind(array2);
			else
				busybody.array.copyAll(array1, array2);
		}
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
		
		busybody.makeObservable(object1);
		busybody.makeObservable(object2);
		
		return busybody.tryBind(object1, property1, object2, property2, twoWay);
    };

    busybody.canObserve = function (object) {
        
			//TODO: test array bit
        return object instanceof busybody.array || !!busybody.getObserver(object);
    }; 

    busybody.del = function (object, property) {
        
        var target = busybody.getObserver(object);
        
        if (target)
            return target.del(property);
    };
    
    busybody.dispose = function (object) {
        var target = busybody.getObserver(object);
        
        if (target)
            return target.dispose();
    };

    window.bb = busybody;
}(window.orienteer));