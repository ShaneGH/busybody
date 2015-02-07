
Class("obsjs.callbacks.propertyCallback", function () {
        
    function propertyCallback(callback, context, evaluateOnEachChange, evaluateIfValueHasNotChanged) {
        this.callback = callback;
        this.context = context;
        this.evaluateOnEachChange = evaluateOnEachChange;
        this.evaluateIfValueHasNotChanged = evaluateIfValueHasNotChanged;
    }

    propertyCallback.prototype.evaluateSingle = function (change, nextChange) {
        if (!this.evaluateOnEachChange) return;

        if (!this.activated) {
            if (this.activatingChange === change) {
                this.activated = true;
                delete this.activatingChange;
            } else
                return;
        }

        if (this.deactivated || this.deactivatingChange === change)
            return true;

        //TODO setTimeout?
        var newVal = nextChange ? nextChange.oldValue : change.object[change.name];
        if (this.evaluateIfValueHasNotChanged || newVal !== change.oldValue)
            this.callback.call(this.context, change.oldValue, newVal);
    };

    propertyCallback.prototype.evaluateMultiple = function (changes) {
        if (this.evaluateOnEachChange || !changes.length) return;

        if (this.deactivated) return true;
        
        var beginAt = 0, endAt = changes.length, deactivate = false;
        if (!this.activated) {
            beginAt = changes.indexOf(this.activatingChange);
            if (beginAt !== -1) {            
                this.activated = true;
                delete this.activatingChange;
            }
            
            // if == -1 case later on
        }

        if (this.deactivatingChange) {
            endAt = changes.indexOf(this.deactivatingChange);
            if (endAt === -1) {
                endAt = changes.length;                
            } else {
                deactivate = true;
                delete this.deactivatingChange;
            }
        }
                
        if (beginAt !== -1) {
            //TODO setTimeout?
            var newVal = changes[endAt] ? changes[endAt].oldValue : changes[0].object[changes[0].name];
            if (this.evaluateIfValueHasNotChanged || newVal !== changes[beginAt].oldValue)
                this.callback.call(this.context, changes[beginAt].oldValue, newVal);
        }
        
        return deactivate;
    };
    
    return propertyCallback;
});