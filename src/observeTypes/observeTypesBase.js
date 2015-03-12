
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