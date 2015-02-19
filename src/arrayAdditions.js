(function () {
    
    var array = obsjs.array;
    
    //TODO: old implementation was not updating length.
    //TODO: use old emeplemntation, there are already tests in place
    array.prototype.replace = function(index, replacement) {
        
        /*
        if (!useObjectObserve)
            this.registerChangeBatch([{
                name: index.toString(),
                object: this,
                oldValue: this[index],
                type: "update"
            }]);
        
        return this.alteringLength(function() {
            if (this.length <= index)
                this.length = index + 1;
                
            return this[index] = replacement;
        });*/
        
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

        return this.alteringLength(function() {
            return Array.prototype.pop.call(this);
        });
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

        return this.alteringLength(function() {
            return Array.prototype.shift.call(this);
        });
    };

    array.prototype.remove = function(item) {

        var i;
        if ((i = this.indexOf(item)) !== -1)
            this.splice(i, 1);
    };

    array.prototype.push = function(item) {

        if (!useObjectObserve)
            this.registerChangeBatch([{
                addedCount: 1,
                index: this.length,
                object: this,
                removed: [],
                type: "splice"
            }]);

        return this.alteringLength(function() {
            return Array.prototype.push.call(this, item);
        });
    };

    //TODO: test
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
        
        return this.alteringLength(function() {
            return Array.prototype.reverse.call(this);
        });
    };

    //TODO: test
    array.prototype.sort = function() {
		
		var args = arguments;
        if (!useObjectObserve) {
                
			var copy = this.slice(), cb = [];
        	var output = this.alteringLength(function() {
				return Array.prototype.sort.apply(this, args);
			});
			
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
        
        return this.alteringLength(function() {
            return Array.prototype.sort.apply(this, args);
        });
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

        var args = arguments;
        return this.alteringLength(function() {
            return Array.prototype.splice.apply(this, args);
        });
    };

    //TODO
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
}());