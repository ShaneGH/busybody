# busybody
###An Object.observe library that gets all up in yo business
busybody supports non Object.observe environments as far back as IE 9

##Index
* [Observe](#observing-a-value)
* [Observe a path](#observe-a-path)
* [Observable Arrays](#observable-arrays)
* [Bind Arrays](#bind-arrays)
* [Computed Observables](#computed-observables)
* [Performance gains](#performance-gains)
* [Core function list](#core-function-list)

##Usage
###Observing a value
```javascript
var myObject = {
	myProperty: true
};

busybody.observe(myObject, "myProperty", function (oldValue, newValue) {
	console.log("myProperty has changed from: " + oldValue + " to " + newValue + ".")
});

myObject.myProperty = false;
```
####busybody.observe arguments
|Name|Type|Description|Optional |
| --- | --- | --- | --- |
|object|Object|The object which contains the property to observe|No|
|property|String|The property|No|
|callback|Function|The callback to execute|No|
|context|Object|The "this" in the callback|Yes|
|options|Object|Options for the callback|Yes|
|options.useRawChanges|Boolean|Default: false. Use the change objects from the Object.observe as arguments|Yes|
|options.evaluateOnEachChange|Boolean|Default: false. Evaluate once for each change rather than on an amalgamation of changes|Yes|
|options.evaluateIfValueHasNotChanged|Boolean|Default: false. Evaluate if the oldValue and the newValue are the same|Yes|
|options.activateImmediately|Boolean|Default: false. Activate the callback now, meaning it could get changes which were applied before the callback was created|Yes|
|**returns**|**busybody.disposable**|**Returns an object with a dispose function to cancel the subscriptions**|

###Attempting to observe a value
Objects are not observable by default. Sometimes you may want to observe a value only *if possible*

```javascript
var myObject = {
	myProperty: true
};

busybody.tryObserve(myObject, "myProperty", function (oldValue, newValue) {
	console.log("myProperty has changed from: " + oldValue + " to " + newValue + ".")
});

myObject.myProperty = false;
```

In this case, the value will not be observed, as `myObject` is not observable. In order to observe it correctly use the following code:
```javascript
var myObject = {
	myProperty: true
};

busybody.makeObservable(myObject);
busybody.tryObserve(myObject, "myProperty", function (oldValue, newValue) {
	console.log("myProperty has changed from: " + oldValue + " to " + newValue + ".")
});

myObject.myProperty = false;
```
####busybody.tryObserve arguments
busybody.tryObserve arguments are the same as [busybody.observe arguments](#busybodyobserve-arguments)


###Observe a path
Observing paths is the same as observing properties
```javascript

// objects which are not observable in a path cannot be observed.
// makeObservable(...) will make an object observable without altering it
var myObject = {
	myProperty1: busybody.makeObservable({
		myProperty2: true
	})
};

busybody.observe(myObject, "myProperty1.myProperty2", function (oldValue, newValue) {
	console.log("myProperty2 has changed from: " + oldValue + " to " + newValue + ".")
});

myObject.myProperty1.myProperty2 = false;
```
####busybody.observe path arguments
|Name|Type|Description|Optional |
| --- | --- | --- | --- |
|object|Object|The root of the path|No|
|property|String|The property|No|
|callback|property|The callback to execute|No|
|context|Object|The "this" in the callback|Yes|
|**returns**|**busybody.disposable**|**Returns an object with a dispose function to cancel the subscriptions**|
####Valid paths:
* `property1.property2`
* `property1[3].property2`

####Invalid paths:
* `property1["property2"]`
* `property1[aValue]`
* `property1.property2().property3`

###Observable Arrays
To observe changes to an array you must create a busybody.array

```javascript
var myArray = busybody.array([1, 2, 3]);

busybody.observe(myArray, function (removedValues, addedValues, indexes) {
	console.log("Added values: " + addedValues + ".");
	console.log("Removed values: " + removedValues + ".");
});

myArray.push(4);
```
####busybody.observe array arguments
|Name|Type|Description|Optional |
| --- | --- | --- | --- |
|object|Object|The object which contains the property to observe|No|
|callback|property|The callback to execute|No|
|context|Function|The "this" in the callback|Yes|
|options|Object|Options for the callback|Yes|
|options.useRawChanges|Boolean|Default: false. Use the change objects from the Array.observe as arguments|Yes|
|options.evaluateOnEachChange|Boolean|Default: false. Evaluate once for each change rather than on an amalgamation of changes|Yes|
|**returns**|**busybody.disposable**|**Returns an object with a dispose function to cancel the subscriptions**|

####busybody.array functionality
busybody.arrays are almost the same as javascript Arrays with a few small exceptions:
* There is a `remove(...)` function which removes the specified element from the array
* You can use the following notation `myArray[2] = {};` but older browsers will not publish changes to the array. Use `myArray.replace(2, {});` instead.
* Do not include the final argument of the callback `indexes` if it will not be used. This will give a small performance gain.

###Bind Arrays
You can bind 2 arrays together. The tryBindArrays function will take a *best attempt* approach to binding, meaning that if an array is not observable it will ignore that part

```javascript
var myArray1 = busybody.array([1, 2, 3]);
var myArray2 = busybody.array();

busybody.tryBindArrays(myArray1, myArray2, true);

console.log(myArray2);
```
####busybody.tryBindArrays arguments
|Name|Type|Description|Optional |
| --- | --- | --- | --- |
|array1|busybody.array|The first array|No|
|array2|busybody.array|The second array|No|
|twoWay|Boolean|The "this" in the callback|Yes|
|**returns**|**busybody.disposable**|**If any subscriptions were made, this function returns an object with a dispose function to cancel the subscriptions**|


















