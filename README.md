# busybody
####An Object.observe library that gets all up in yo business
busybody supports non Object.observe environments as far back as IE 9



##Index
* [Observe](#observing-a-value)
* [Observe a path](#observe-a-path)
* [Observable Arrays](#observable-arrays)
* [Bind Arrays](#bind-arrays)
* [Bind Properties](#bind-properties)
* [Computed Observables](#computed-observables)
* [Complex Computed Observables](#complex-computed-observables)
* [Computed Observables with Arrays](#computed-observables-with-arrays)
* [Performance gains](#performance-gains)
* [Core function list](#core-function-list)



##Observing a value
```javascript
var myObject = {
	myProperty: true
};

busybody.observe(myObject, "myProperty", function (oldValue, newValue) {
	console.log("myProperty has changed from: " + oldValue + " to " + newValue + ".")
});

myObject.myProperty = false;
```
###busybody.observe arguments
|Name|Type|Description|Optional |
| --- | --- | --- | --- |
|object|Object|The object which contains the property to observe|No|
|property|String|The property|No|
|callback|Function|The callback to execute|No|
|context|Object|The "this" in the callback|Yes|
|options|Object|Options for the callback|Yes|
|options => useRawChanges|Boolean|Default: false. Use the change objects from the Object.observe as arguments|Yes|
|options => evaluateOnEachChange|Boolean|Default: false. Evaluate once for each change rather than on an amalgamation of changes|Yes|
|options => evaluateIfValueHasNotChanged|Boolean|Default: false. Evaluate if the oldValue and the newValue are the same|Yes|
|options => activateImmediately|Boolean|Default: false. Activate the callback now, meaning it could get changes which were applied before the callback was created|Yes|
|**returns**|**busybody.disposable**|**Returns an object with a dispose function to cancel the subscriptions**|



##Attempting to observe a value
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
###busybody.tryObserve arguments
busybody.tryObserve arguments are the same as [busybody.observe arguments](#busybodyobserve-arguments)



##Observe a path
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
###busybody.observe path arguments
|Name|Type|Description|Optional |
| --- | --- | --- | --- |
|object|Object|The root of the path|No|
|property|String|The property|No|
|callback|property|The callback to execute|No|
|context|Object|The "this" in the callback|Yes|
|**returns**|**busybody.disposable**|**Returns an object with a dispose function to cancel the subscriptions**|
###Valid paths:
* `property1.property2`
* `property1[3].property2`

###Invalid paths:
* `property1["property2"]`
* `property1[aValue]`
* `property1.property2().property3`



##Observable Arrays
To observe changes to an array you must create a busybody.array

```javascript
var myArray = busybody.array([1, 2, 3]);

busybody.observe(myArray, function (removedValues, addedValues, indexes) {
	console.log("Added values: " + addedValues + ".");
	console.log("Removed values: " + removedValues + ".");
});

myArray.push(4);
```
###busybody.observe array arguments
|Name|Type|Description|Optional |
| --- | --- | --- | --- |
|object|Object|The object which contains the property to observe|No|
|callback|property|The callback to execute|No|
|context|Function|The "this" in the callback|Yes|
|options|Object|Options for the callback|Yes|
|options => useRawChanges|Boolean|Default: false. Use the change objects from the Array.observe as arguments|Yes|
|options => evaluateOnEachChange|Boolean|Default: false. Evaluate once for each change rather than on an amalgamation of changes|Yes|
|**returns**|**busybody.disposable**|**Returns an object with a dispose function to cancel the subscriptions**|

###busybody.array functionality
busybody.arrays are almost the same as javascript Arrays with a few small exceptions:
* There is a `remove(...)` function which removes the specified element from the array
* You can use the following notation `myArray[2] = {};` but older browsers will not publish changes to the array. Use `myArray.replace(2, {});` instead.
* Do not include the final argument of the callback `indexes` if it will not be used. This will give a small performance gain.



##Bind Arrays
You can bind 2 arrays together. This will mean that changes to one array will result in changes to another. The tryBindArrays function will take a *best attempt* approach to binding, meaning that if an array is not observable it will ignore that part

```javascript
var myArray1 = busybody.array([1, 2, 3]);
var myArray2 = busybody.array();

busybody.tryBindArrays(myArray1, myArray2, true);

console.log(myArray2);
```
###busybody.tryBindArrays arguments
|Name|Type|Description|Optional |
| --- | --- | --- | --- |
|array1|busybody.array|The first array|No|
|array2|busybody.array|The second array|No|
|twoWay|Boolean|Bind the first array to the second array also|Yes|
|**returns**|**busybody.disposable**|**If any subscriptions were made, this function returns an object with a dispose function to cancel the subscriptions**|



##Bind Properties
You can bind the values of 2 properties together. This will mean that changes to a property of an object will result in changes to another property of another object.

```javascript
var myObject1 = {myProperty: true};
var myObject2 = {};

busybody.bind(myObject1, "myProperty", myObject2, "myProperty", true);

console.log(myObject2.myProperty);
```
###busybody.bind arguments
|Name|Type|Description|Optional |
| --- | --- | --- | --- |
|object1|Object|The first object|No|
|property1|String|The first property|No|
|object2|Object|The second object|No|
|property2|String|The second property|No|
|twoWay|Boolean|Bind the first object to the object array also|Yes|
|doNotSet|Boolean|If true, do not set the value of object2 to the value of object1 (mostly for internal use)|Yes|
|**returns**|**busybody.disposable**|**Returns an object with a dispose function to cancel the subscriptions**|



##Computed Observables
Computed observables are properties which are based on the evaluation of a function. When the result of the function changes, the computed observable changes also.


```javascript
var john = {
	firstName: "John",
	lastName: "Watson"
};

busybody.computed(john, "fullName", function () {
	return this.firstName + " " + this.lastName;
});

console.log(john.fullName);
```
###busybody.computed arguments
|Name|Type|Description|Optional |
| --- | --- | --- | --- |
|callback|Function|The logic which returns the computed value|No|
|context|Object|The "this" value in the callback|No|
|options|Object|Computed options|Yes|
|[options => watchVariables](#complex-computed-observables)|Object|Default: null. A dictionary of variables in the callback which are to be watched|Yes|
|[options => observeArrayElements](#computed-observables-with-arrays)|Boolean|Default: false. If set to true, the computed will attempt to watch values within any array watch variables. This is useful if the computed is an aggregate function. The default is false because it is expensive computationally|Yes|
|options => allowWith|Boolean|Default: false. If set to true, `with (...)` statements are allowed in the computed function. Although variables accessed within the with statement cannot be observed|Yes|
|options => delayExecution|Boolean|Default: false. If set to true, the computed will not be activated until it's `execute(...)` function is called or a value within the computed changes|Yes|
|**returns**|**busybody.observeTypes.computed**|**Returns an object with a dispose function to cancel the computed**|

###busybody.computed functionality
busybody.computeds are not complete as of v0.1.0, so go easy on them. Computeds work by code analysis, so make your code simple and try to avoid comments and strings.



##Complex Computed Observables
You can include other variables in the computed also as long as you include them as `watchVariables`


```javascript
var john = {
	firstName: "John",
	lastName: "Watson"
};
var barry = {
	firstName: "Barry",
	lastName: "Johnson"
};

busybody.computed(john, "barryAndI", function () {
	return barry.firstName + " and " + this.firstName;
}, {
	watchVariables: { barry: barry }
});

console.log(john.barryAndI);
```



##Computed Observables with Arrays
If your computed is an aggregate function you will need to include a flag as part of the options. The `observeArrayElements` value tells the computed to go deeper with it's code analysis.


```javascript
var john = {
	firstName: "John",
	lastName: "Watson"
};
var barry = {
	firstName: "Barry",
	lastName: "Johnson"
};
var mike = {
	firstName: "Mike",
	lastName: "Paulson",
	firends: busybody.array([john, barry])
};

busybody.computed(mike, "myFriends", function () {
	var output = [];
	var length = this.friends.length;
	for (var i = 0; i < length; i++)
		output.push(this.friends[i].firstName);
	
	return output.join(", ");
}, { observeArrayElements: true });

console.log(mike.myFriends);
```



##Performance Gains
To improve performance you can use busybody.observables rather than regular objects. The downside is that the busybody.observable has a few values which will be enumerated over in a `for (var i in myObservable)` situation.
```javascript
var myObject = new busybody.observable();
myObject.myProperty = true;

// observation 1
busybody.observe(myObject, "myProperty", function (oldValue, newValue) {
	console.log("myProperty has changed from: " + oldValue + " to " + newValue + ".")
});

// observation 2
myObject.observe("myProperty", function (oldValue, newValue) {
	console.log("myProperty has changed from: " + oldValue + " to " + newValue + ".")
});

myObject.myProperty = false;
```





```javascript
var myObject = {
	myProperty: true
};

busybody.observe(myObject, "myProperty", function (oldValue, newValue) {
	console.log("myProperty has changed from: " + oldValue + " to " + newValue + ".")
});

myObject.myProperty = false;
```
















