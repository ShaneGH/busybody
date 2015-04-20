// name is subject to change

Class("busybody.utils.executeCallbacks", function () {
	
	var executeCallbacks = busybody.disposable.extend(function executeCallbacks() {
		if (this.constructor === executeCallbacks) throw "You cannot create an instance of an abstract class";
		
		this._super();
		
		this.callbacks = [];
	});
	
	executeCallbacks.prototype.addCallback = function (callback) {
		var op = busybody.utils.obj.addWithDispose(this.callbacks, callback);
		this.registerDisposable(op);
		
		return op;
	};
        
    executeCallbacks.prototype._execute = function() {
		throw "Abstract methods must be implemented";
		// returns { cancel: true | false, arguments: [] }
	};
	
    executeCallbacks.prototype.execute = function() {
		var args = this._execute();
		
		if (args && !args.cancel)
			enumerateArr(this.callbacks.slice(), function (cb) {
				cb.apply(null, args.arguments || []);
			});
    };
    
    executeCallbacks.prototype.dispose = function () {
		this._super();
		
		// clear __executePending timeout?
		
		this.callbacks.length = 0;
    };
	
	return executeCallbacks;
});