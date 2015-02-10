
Class("obsjs.callbacks.changeCallback", function () {
        
    var changeCallback = objjs.object.extend(function changeCallback(evaluateOnEachChange) {
        this._super();
        
        this.evaluateOnEachChange = evaluateOnEachChange;
    });
    
    changeCallback.dispose = {};
    
    changeCallback.prototype.activate = function (activatingChange) {
        if (this.activated || this.activatingChange)
            throw "This callback has been activated";
        
        this.activatingChange = activatingChange;
    };
    
    changeCallback.prototype.deactivate = function (deactivatingChange) {
        if (this.deactivatingChange)
            throw "This callback has a deactivate pending";
        
        if (arguments.length)
            this.deactivatingChange = deactivatingChange;
        else 
            this.activated = false;
    };

    changeCallback.prototype.evaluateSingle = function (changes, changeIndex) {
        
        if (!this.evaluateOnEachChange) return;

        if (this.activated === false || this.deactivatingChange === changes[changeIndex]) {            
            this.activated = false;
            return changeCallback.dispose;
        }

        if (!this.hasOwnProperty("activated")) {
            if (this.activatingChange === changes[changeIndex]) {
                this.activated = true;
                delete this.activatingChange;
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

        if (this.activated === false) return changeCallback.dispose;
        
        var beginAt = 0, endAt = changes.length, output = undefined;
        if (!this.hasOwnProperty("activated")) {
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
                output = changeCallback.dispose;
                this.activated = false;
                delete this.deactivatingChange;
            }
        }
                
        if (beginAt !== -1) {
            this._evaluateMultiple(changes, beginAt, endAt);
        }
        
        return output;
    };
    
    changeCallback.prototype._evaluateMultiple = function (changes) {
        throw "Abstract methods must be implemented";
    };
    
    return changeCallback;
});