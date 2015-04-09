
Class("obsjs.disposable", function () {
    
	function init (disp) {
		if (!disp.$disposables) disp.$disposables = {};
	}
	
    var disposable = objjs.object.extend(function disposable(disposableOrDisposeFunction) {
        ///<summary>An object which can be disposed</summary>
        
        this._super();
        
        if (!disposableOrDisposeFunction)
            ;
        else if (disposableOrDisposeFunction instanceof Function)
            this.registerDisposeCallback(disposableOrDisposeFunction);
        else
            this.registerDisposable(disposableOrDisposeFunction);
    });
    
    disposable.prototype.disposeOf = function(key) {
        ///<summary>Dispose of an item registered as a disposable</summary>
        ///<param name="key" type="String" optional="false">The key of the item to dispose</param>
		
		if (key instanceof Array) {
			var result = false;
			enumerateArr(key, function (key) {
				result |= this.disposeOf(key);
			}, this);
			
			return result;
		}
		
        if(this.$disposables && this.$disposables[key]) {
            this.$disposables[key]();
            return delete this.$disposables[key];
        }
		
		return false;
    };
    
    disposable.prototype.disposeOfAll = function() {
        ///<summary>Dispose of all items registered as a disposable</summary>
		if (this.$disposables)
			for(var i in this.$disposables)
				this.disposeOf(i);
    };
    
    disposable.prototype.registerDisposeCallback = (function() {
        var i = 0;
        return function(disposeFunction) {
            ///<summary>Register a dispose function which will be called when this object is disposed of.</summary>
            ///<param name="disposeFunction" type="Function" optional="false">The function to call when on dispose</param>
            ///<returns type="String">A key to dispose off this object manually</returns>

            if(!disposeFunction || disposeFunction.constructor !== Function) throw "The dispose function must be a Function";

			init(this);
            var id = (++i).toString();            
            this.$disposables[id] = disposeFunction;            
            return id;
        };
    })();
    
    disposable.prototype.registerDisposable = function(disposableOrDisposableGetter) {
        ///<summary>An object with a dispose function to be disposed when this object is disposed of.</summary>
        ///<param name="disposableOrDisposableGetter" type="Function" optional="false">The function to dispose of on dispose, ar a function to get this object</param>
        ///<returns type="String">A key to dispose off this object manually</returns>
        
        if(!disposableOrDisposableGetter) return;
        if(disposableOrDisposableGetter.constructor === Function && !disposableOrDisposableGetter.dispose) disposableOrDisposableGetter = disposableOrDisposableGetter.call(this);        
        if(!disposableOrDisposableGetter || !(disposableOrDisposableGetter.dispose instanceof Function)) throw "The disposable object must have a dispose(...) function";

        return this.registerDisposeCallback(disposableOrDisposableGetter.dispose.bind(disposableOrDisposableGetter));
    };
    
    disposable.prototype.dispose = function() {
        ///<summary>Dispose of this disposable</summary>
        
        this.disposeOfAll();
    };
                                      
    return disposable;
});