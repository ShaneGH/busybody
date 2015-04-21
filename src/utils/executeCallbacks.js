// name is subject to change

Class("busybody.utils.executeCallbacks", function () {
	
	var executeCallbacks = busybody.disposable.extend(function executeCallbacks() {
		///<summary>Base class for objects with an execute(...) function which executes a list of callbacks<summary>
		
		if (this.constructor === executeCallbacks) throw "You cannot create an instance of an abstract class";
		
		this._super();
		
		this.callbacks = [];
	});
	
	executeCallbacks.prototype.addCallback = function (callback) {
		///<summary>Add a callback<summary>
		///<param name="callback" type="Function">The callback<param>
		///<param name="property" type="String">The property<param>
		///<returns type="busybody.disposable">A dispose object<param>
		
		var op = busybody.utils.obj.addWithDispose(this.callbacks, callback);
		this.registerDisposable(op);
		
		return op;
	};
        
    executeCallbacks.prototype._execute = function() {
		///<summary>Abstract. Execute and return argumets for the callbacks<summary>
		///<returns type="Object">Arguments for the callbacks in the form of { cancel: true | false, arguments: [] }<param>
		
		throw "Abstract methods must be implemented";
	};
	
    executeCallbacks.prototype.execute = function() {
		///<summary>Execute all callbacks<summary>
		
		var args = this._execute();
		
		if (args && !args.cancel)
			enumerateArr(this.callbacks.slice(), function (cb) {
				cb.apply(null, args.arguments || []);
			});
    };
    
    executeCallbacks.prototype.dispose = function () {
		///<summary>Dispose<summary>
		
		this._super();		
		this.callbacks.length = 0;
    };
	
	return executeCallbacks;
});