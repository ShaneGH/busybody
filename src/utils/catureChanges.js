Class("obsjs.utils.captureChanges", function () {
    var observableBase = obsjs.observableBase;
    
    function catptureChanges () {
    }
    
    if (useObjectObserve) {
        catptureChanges._captureChanges = observableBase._captureChanges = function (forObject, logic, callback, captureType) {

            captureType.observe(forObject, callback);
            logic();
            captureType.unobserve(forObject, callback);
        };
    } else {
        function captureArrayChanges (forObject, logic, callback) {
        }
        
        function captureObjectChanges (forObject, logic, callback) {
        }
        
        catptureChanges._captureChanges = observableBase._captureChanges = function (forObject, logic, callback, captureType) {

            if (captureType === Array && forObject instanceof obsjs.array)
                return captureArrayChanges(forObject, logic, callback);
            if (captureType === Object)
                return captureArrayChanges(forObject, logic, callback);
            
            throw "Invalid capture type.";
        };
    }
    
    catptureChanges.captureArrayChanges = observableBase.captureArrayChanges = function (forObject, logic, callback) {
        return observableBase._captureChanges(forObject, logic, function (changes) {
            changes = changes.slice();
            for (var i = changes.length - 1; i >= 0; i--)
                if (!obsjs.arrayBase.isValidArrayChange(changes[i]))
                    changes.splice(i, 1);
                    
            return callback(changes);
        }, Array);
    };
    
    catptureChanges.captureChanges = observableBase.captureChanges = function (forObject, logic, callback) {
        return observableBase._captureChanges(forObject, logic, callback, Object);
    };
    
    return catptureChanges;
});