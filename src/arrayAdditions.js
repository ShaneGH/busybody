(function () {
    
    var array = busybody.array;
    
    array.prototype.replace = function(index, replacement) {        
        this.splice(index, index >= this.length ? 0 : 1, replacement);
        return replacement;
    };

    array.prototype.pop = function() {

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

        var i;
        if ((i = this.indexOf(item)) !== -1)
            this.splice(i, 1);
    };

    array.prototype.push = function() {

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

    array.prototype.reverse = function(item) {

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

    array.prototype.sort = function() {
		
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