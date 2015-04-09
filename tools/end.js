    
    obsjs.getObserver = function (object) {
                
        return object == null || object instanceof obsjs.observableBase ?
            object :
            (object.$observer instanceof obsjs.observableBase ? object.$observer : null);
    };
    
    obsjs.captureArrayChanges = function (forObject, logic, callback) {
        if (!(forObject instanceof obsjs.array))
            throw "Only obsjs.array objects can have changes captured";
        
        return forObject.captureArrayChanges(logic, callback);
    };
    
    obsjs.captureChanges = function (forObject, logic, callback, property) {
        forObject = obsjs.getObserver(forObject);
        
		if (forObject)
        	return forObject.captureChanges(logic, callback, property);
		else
			logic();
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

    obsjs.tryObserve = function (object, property, callback, context, options) {
        
        if (object instanceof obsjs.array) {
			if (property instanceof Function)
            	return object.observe(arguments[1], arguments[2], arguments[3]);    // property names are misleading in this case
			if (property === "length")
				property = "$length";
			
			obsjs.makeObservable(object);	//TODO: test
		}
        
        var target = obsjs.getObserver(object);
        
        if (target)
            return target.observe(property, callback, context, options);
        
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
	
	var index = (function () {
		var i = 0;
		return function () {
			return "ch-" + (++i);
		};
	}());

	function tryBind (object1, property1, object2, property2) {
		
		return obsjs.tryObserve(object1, property1, function (changes) {
			
			var observer1 = obsjs.getObserver(object1);
			if (observer1.$bindingChanges)
				for (var i in observer1.$bindingChanges)
					if (object2 === observer1.$bindingChanges[i].fromObject
						&& changes[changes.length - 1] === observer1.$bindingChanges[i].change)
						return;
			
			obsjs.captureChanges(object2, function () {
				obsjs.utils.obj.setObject(property2, object2, obsjs.utils.obj.getObject(property1, object1));
			}, function (changes) {
				var observer2 = obsjs.makeObservable(object2);
				enumerateArr(changes, function (change) {
					
					if (!object2.$bindingChanges)
						object2.$bindingChanges = {};
		
					var i = index();
					object2.$bindingChanges[i] = {change: change, fromObject: object1};
					setTimeout(function () {
						delete object2.$bindingChanges[i];
						for (var j in object2.$bindingChanges)
							return;
						
						delete object2.$bindingChanges;
					}, 100);
				});
			});
		}, null, {useRawChanges: true});
	}

    obsjs.tryBind = function (object1, property1, object2, property2) {
		var d1 = tryBind(object1, property1, object2, property2);
		var d2 = tryBind(object2, property2, object1, property1);
		
		if (d1 && d2) {
			var dispose = new obsjs.disposable(d1);
			dispose.registerDisposable(d2);
			return dispose;
		}
		
		return d1 || d2;
    };
    
    obsjs.bind = function (object1, property1, object2, property2) {
		
		obsjs.makeObservable(object1);
		obsjs.makeObservable(object2);
		
		return obsjs.tryBind(object1, property1, object2, property2);
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