useObjectObserve ?
Class("obsjs.array", function () {
    
    var array = obsjs.arrayBase.extend(function array (initialValues) {
        
        this._super.apply(this, arguments);
    });
         
    array.prototype.onNextArrayChange = function (callback) {

        var cb = (function (changes) {
            if (!cb) return;
            for (var i = 0, ii = changes.length; i < ii; i++) {
                if (obsjs.arrayBase.isValidArrayChange(changes[i])) {    
                    Array.unobserve(this, cb);
                    cb = null;
                    callback(changes[i]);
                    return;
                }
            }
        }).bind(this);

        Array.observe(this, cb);
    };

    array.prototype._init = function () {
        //TODO: dispose
        if (this.__subscription) return;
        
        this.__subscription = this.registerChangeBatch.bind(this);
        Array.observe(this, this.__subscription);
    };
    
    array.prototype.dispose = function () {
        this._super();        
        
        if (this.__subscription) {
            Array.unobserve(this, this.__subscription);
            delete this.__subscription;
        }
    };
    
    return array;
}) :
Class("obsjs.array", function () {
    
    var array = obsjs.arrayBase.extend(function array (initialValues) {
        
        this._super.apply(this, arguments);
        
        this.$onNextArrayChanges = [];
    });    
    
    array.prototype.registerChangeBatch = function (changes) {
        
        for (var i = 0, ii = changes.length; i < ii; i++) {
            if (obsjs.arrayBase.isValidArrayChange(changes[i])) {
                enumerateArr(this.$onNextArrayChanges.splice(0, this.$onNextArrayChanges.length), function (cb) {
                    cb(changes[i]);
                });
                
                break;
            }
        }
        
        return this._super(changes);
    };
         
    array.prototype.onNextArrayChange = function (callback) {

        this.$onNextArrayChanges.push(callback);
    };

    array.prototype._init = function () {
        // unneeded
    };
    
    return array;
});