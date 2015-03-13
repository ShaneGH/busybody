    
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