
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