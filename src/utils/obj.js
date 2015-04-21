    
var enumerateArr = function(enumerate, action, context) {
    ///<summary>Enumerate through an array or object</summary>
    ///<param name="enumerate" type="Any">An item to enumerate over</param>
    ///<param name="action" type="Function">The callback to apply to each item</param>
    ///<param name="context" type="Any" optional="true">The context to apply to the callback</param>
    
    if (!enumerate) return;
    
    context = context || window;
    
    for(var i = 0, ii = enumerate.length; i < ii; i++)
        action.call(context, enumerate[i], i);
};
    
var enumerateObj = function(enumerate, action, context) {
    ///<summary>Enumerate through an array or object</summary>
    ///<param name="enumerate" type="Any">An item to enumerate over</param>
    ///<param name="action" type="Function">The callback to apply to each item</param>
    ///<param name="context" type="Any" optional="true">The context to apply to the callback</param>
    
    if (!enumerate) return;
    
    context = context || window;
        
    if(enumerate == null) return;

    for(var i in enumerate)
        action.call(context, enumerate[i], i);
};

var Class = function(classFullName, accessorFunction) {
    ///<summary>Create an busybody class</summary>
    ///<param name="classFullName" type="String">The name of the class</param>
    ///<param name="accessorFunction" type="Function">A function which returns the class</param>
    
    classFullName = classFullName.split(".");
    var namespace = classFullName.splice(0, classFullName.length - 1);
    
    var tmp = {};
    tmp[classFullName[classFullName.length - 1]] = accessorFunction();
    
    Extend(namespace.join("."), tmp);
    
    return tmp[classFullName[classFullName.length - 1]];
};

var Extend = function(namespace, extendWith) {
    ///<summary>Similar to $.extend but with a namespace string which must begin with "busybody"</summary>
    ///<param name="namespace" type="String">The namespace to add to</param>
    ///<param name="extendWith" type="Object">The object to add to the namespace</param>
    
    namespace = namespace.split(".");
    
    if(namespace[0] !== "busybody") throw "Root must be \"busybody\".";
    namespace.splice(0, 1);
    
    var current = busybody;
    enumerateArr(namespace, function(nsPart) {
        current = current[nsPart] || (current[nsPart] = {});
    });
    
    if(extendWith && extendWith instanceof Function) extendWith = extendWith();
    enumerateObj(extendWith, function(item, i) {
        current[i] = item;
    });
};
    
var _trimString = /^\s+|\s+$/g;
var trim = function(string) {
    ///<summary>Trims a string</summary>
    ///<param name="string" type="String">The string to trim</param>
    ///<returns type="String">The trimmed string</returns>
    
    return string ? string.replace(_trimString, '') : string;
};

Class("busybody.utils.obj", function () {
        
    var arrayMatch = /\[\s*\d\s*\]$/g;
    var splitPropertyName = function(propertyName) {
		///<summary>Split a path into strings and numbers</summary>
		///<param name="propertyName" type="String">The name</param>
		///<returns type="[String|Number]">The path</param>
		
        propertyName = propertyName.split(".");
        
        var tmp;
        for (var i = 0; i < propertyName.length; i++) {
            propertyName[i] = busybody.utils.obj.trim(propertyName[i]);
            var match = propertyName[i].match(arrayMatch);
            if (match && match.length) {
                if (tmp = busybody.utils.obj.trim(propertyName[i].replace(arrayMatch, ""))) {
                    propertyName[i] = busybody.utils.obj.trim(propertyName[i].replace(arrayMatch, ""));
                } else {
                    propertyName.splice(i, 1);
                    i--;
                }
                
                for (var j = 0, jj = match.length; j < jj; j++)
                    propertyName.splice(++i, 0, parseInt(match[j].match(/\d/)[0]));
            }
        }
        
        return propertyName;
    };
    
    var joinPropertyName = function (propertyName) {
		///<summary>Join a path</summary>
		///<param name="propertyName" type="[String|Number]">The path</param>
		///<returns type="String">The name</param>
		
        var output = [];
        enumerateArr(propertyName, function (item) {
            if (!isNaN(item))
                output.push("[" + item + "]");
            else if (output.length === 0)
                output.push(item);
            else
                output.push("." + item);
        });
        
        return output.join("");
    }
    
    var getObject = function(propertyName, context) {
        ///<summary>Get an object from string</summary>
        ///<param name="propertyName" type="String">A pointer to the object to get</param>
        ///<param name="context" type="Any" optional="true">The root context. Defaults to window</param>
        ///<returns type="Any">The object</returns>
        
        return _getObject(splitPropertyName(propertyName), context);
    };
    
    var getPartialObject = function(propertyName, context, index) {
        ///<summary>Get an object from part of a string</summary>
        ///<param name="propertyName" type="String">A pointer to the object to get</param>
        ///<param name="context" type="Any" optional="true">The root context. Defaults to window</param>
        ///<param name="index" type="Number" optional="true">Decide how many parts to evaluate. A value of 0 indicates evaluate all, a value less than 0 indicates that you do not evaluate the last elements, a value greater than 0 indicates that you only evaluate the first elements</param>
        ///<returns type="Any">The object</returns>
		
		var output = {};
		
		propertyName = splitPropertyName(propertyName);
		if (index <= 0)
			output.remainder = propertyName.splice(propertyName.length + index, index * -1);
		else
			output.remainder = propertyName.splice(index, propertyName.length - index);
		
		output.object = _getObject(propertyName, context, index);
		return output;
    };
    
    function _getObject(splitPropertyName, context) {
		
        if(!context) context = window;
        
        for (var i = 0, ii = splitPropertyName.length; i <ii; i++) {
            context = context[splitPropertyName[i]];
            if(context == null)
                return i === ii - 1 ? context : null;
        }
        
        return context;
    };
    
    var setObject = function(propertyName, context, value) {
		///<summary>Set an object path, if possible</summary>
		///<param name="propertyName" type="String">The property</param>
		///<param name="context" type="Object">The object</param>
		///<param name="value" type="Any">The value</param>
		
        propertyName = splitPropertyName(propertyName);
        if (propertyName.length > 1)
            context = _getObject(propertyName.splice(0, propertyName.length -1), context);
        
		if (context)
        	context[propertyName[0]] = value;
    };	

    function addWithDispose(callbackArray, item) {
		///<summary>Add an item to an array and return a disposable which will remove it</summary>
		///<param name="callbackArray" type="[]">The array</param>
		///<param name="item" type="Any">The item</param>
		///<returns type="busybody.disposable">The disposable</param>

        callbackArray.push(item);
        var dispose = new busybody.disposable(function () {
            if (!dispose) return;
            dispose = null;

            item = callbackArray.indexOf(item);
            if (item !== -1)
                callbackArray.splice(item, 1);
        });

        return dispose;
    }
        
    var obj = function obj() { };
    obj.trim = trim;
    obj.addWithDispose = addWithDispose;
    obj.enumerateArr = enumerateArr;
    obj.enumerateObj = enumerateObj;
    obj.getObject = getObject;
    obj.getPartialObject = getPartialObject;
    obj.setObject = setObject;
    obj.splitPropertyName = splitPropertyName;
    obj.joinPropertyName = joinPropertyName;
    
    return obj;
});