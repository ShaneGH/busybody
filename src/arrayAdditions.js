(function () {
    
    var array = busybody.array;
    
    array.prototype.replace = function(index, replacement) {
		///<summary>Replace an element in the array and notify the change handler</summary>
		///<param name="index" type="Number">The index</param>
		///<param name="replacement" type="Any">The replacement</param>
		///<returns type="Any">The replacement</returns>
		
		this.splice(index, index >= this.length ? 0 : 1, replacement);
        return replacement;
    };

    array.prototype.pop = function() {
		///<summary>Remove and return the last element of the array</summary>
		///<returns type="Any">The value</returns>

        if (!useObjectObserve)
            if (this.length)
                this.registerChangeBatch([{
                    addedCount: 0,
                    index: this.length - 1,
                    object: this,
                    removed: [this[this.length - 1]],
                    type: "splice"
                }]);

        return this.alteringArray("pop");
    };

    array.prototype.shift = function() {
		///<summary>Remove and return the first element in the array</summary>
		///<returns type="Any">The value</returns>

        if (!useObjectObserve)
            if (this.length)
                this.registerChangeBatch([{
                    addedCount: 0,
                    index: 0,
                    object: this,
                    removed: [this[0]],
                    type: "splice"
                }]);

        return this.alteringArray("shift");
    };

    array.prototype.remove = function(item) {
		///<summary>Remove an item from the array and reduce the length by 1</summary>
		///<param name="item" type="Any">The item</param>
		///<returns type="Boolean">Whether the array contained the element or not</returns>

        var i;
        if ((i = this.indexOf(item)) !== -1) {
            this.splice(i, 1);
			return true;
		}
		
		return false;
    };

    array.prototype.push = function() {
		///<summary>Add all of the arguments to the end of this array</summary>
		///<returns type="Number">The new length</returns>

        if (!useObjectObserve)
            this.registerChangeBatch([{
                addedCount: arguments.length,
                index: this.length,
                object: this,
                removed: [],
                type: "splice"
            }]);

        return this.alteringArray("push", arguments);
    };

    array.prototype.reverse = function() {
		///<summary>Reverse the contents of this array</summary>

		var length = this.length;
		if (length < 2) return;
		
        if (!useObjectObserve) {
                
            var half = Math.floor(length / 2), cb = [], i2;
            for (var i = 0; i < half; i++) {
            
                cb.push({
                    name: i.toString(),
                    object: this,
                    oldValue: this[i],
                    type: "update"
                });
				
				i2 = length - i - 1;
                cb.push({
                    name: i2.toString(),
                    object: this,
                    oldValue: this[i2],
                    type: "update"
                });
            }
			
            this.registerChangeBatch(cb);
        }
        
        return this.alteringArray("reverse");
    };

    array.prototype.sort = function(sortFunction) {
		///<summary>Sort the elements in the array</summary>
		///<param name="sortFunction" type="Function">A function to compare items</param>
		///<returns type="Array">this</returns>
		
        if (!useObjectObserve) {
                
			var copy = this.slice(), cb = [];
        	var output = this.alteringArray("sort", arguments);
			
			for (var i = 0, ii = copy.length; i < ii; i++)
				if (copy[i] !== this[i])
					cb.push({
						name: i.toString(),
						object: this,
						oldValue: copy[i],
						type: "update"
					});
			
            this.registerChangeBatch(cb);			
			return output;
        }
        
        return this.alteringArray("sort", arguments);
    };

    array.prototype.splice = function(index, removeCount, addItems) {
		///<summary>Add and remove items from an array</summary>
		///<param name="index" type="Number">The point in the array to begin</param>
		///<param name="removeCount" type="Number">The number of items to remove</param>
		///<param name="addItems" type="Any" optional="true">All other arguments will be added to the array</param>
		
        if (!useObjectObserve) {
            var removed = [];
            for(var i = index, ii = removeCount + index > this.length ? this.length : removeCount + index; 
                i < ii; 
                i++)
                removed.push(this[i]);

            this.registerChangeBatch([{
                addedCount: arguments.length - 2,
                index: index,
                object: this,
                removed: removed,
                type: "splice"
            }]);
        }

        return this.alteringArray("splice", arguments);
    };

    //TODO
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
}());