# busybody
###An Object.observe library that gets all up in yo business
busybody supports non Object.observe environments as far back as IE 9

##Index
* [Observe](#observing-a-value)
* [Observe a path](#observe-a-path)
* [Observable Arrays](#observable-arrays)
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

####busybody.array functionality
busybody.arrays are almost the same as javascript Arrays with a few small exceptions:
1. There is a `remove(...)` function which removes the specified element from the array
2. You can use the following notation `myArray[2] = {};` but older browsers will not publish changes to the array.
..* Use `myArray.replace(2, {});` instead.
3. Do not include the final argument of the callback (indexes) if it will not be used. This will give a small performance gain.


