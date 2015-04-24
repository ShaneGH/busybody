
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
		///<returns type="Any">The return value of the callback</param>
        
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
		///<returns type="Any">The return value of the callback</param>
		
        throw "Abstract methods must be implemented";
    };

    changeCallback.prototype.evaluateMultiple = function (changes) {
		///<summary>Evaluate on batch of changes</summary>
		///<param name="changes" type="[Object]">A list of all changes in the batch</param>
		///<returns type="Any">The return value of the callback</param>
		
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
		///<returns type="Any">The return value of the callback</param>
		
        throw "Abstract methods must be implemented";
    };
    
    return changeCallback;
});