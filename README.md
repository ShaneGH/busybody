# busybody
####An Object.observe library that gets all up in yo business
busybody supports non Object.observe environments as far back as IE 9



##Index
* [Installing Busybody](#installing-busybody)
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
* [Quirks](#quirks)



##Installing Busybody
Busybody is a javascript library and just needs to be included on your wepage. Busybody releases are done through github, so you can see and download the latest [here](https://github.com/ShaneGH/busybody/releases). Releases contain a "busybody-{version}.js" and a "busybody-{version}.debug.js" file, and including either of these on your page will allow you to use busybody. The difference between these files is that one is [minimized](http://en.wikipedia.org/wiki/Minification_%28programming%29) and the other is not.

Alternatively, you can pull the source down using [bower](http://bower.io) (with the tag: ShaneGH/busybody#{version number}) and build using [grunt](http://gruntjs.com) and the DEV README.js file included in the project.



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
* Do not include the final argument of the callback (`indexes`) in the callback definition if it will not be used. This will give a small performance gain.



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

busybody.observe(john, "fullName", function (oldValue, newValue) {
	console.log(john.fullName);
})

john.lastName = "Michaels";
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
|**returns**|**busybody.observeTypes .computed**|**Returns an object with a dispose function to cancel the computed**|

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
To improve performance you can use `busybody.observable` objects rather than regular objects. The downside is that the busybody.observable has a few values which will be enumerated over in a `for (var i in myObservable)` situation.
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



##Core Function List

This is a list of the functions exposed by busybody. If the function args are not detailed in this documentation, look at the function in a debugger window (using the debug version of busybody). All functions have full argument documentation within them.

|Name|Description|
| --- | --- |
|bind|Bind two properties together|
|captureArrayChanges|Capture all of the changes to the first argument (array) when the second argument (Function) is executed. The changes are passed to the third object (Function)|
|captureChanges|Capture all of the changes to the first argument (Object) when the second argument (Function) is executed. The changes are passed to the third object (Function)|
|canObserve|Determine whether a `tryObserve` type function will succeed|
|computed|Create a computed property on an object|
|del|delete a property from an object|
|dispose|dispose of an object|
|getObserver|Gets the observer object for an object or return null. The observer is either: The object itself if the object is a busybody.observable or the non enumerable $observer property of the object, if it is a busybody.observable|
|makeObservable|Make an object observable|
|observe|Observe a property of an object|
|observeArray|Observe an array property of an object|
|tryBind|Bind two properties together if possible|
|tryBindArrays|Bind two arrays together if possible|
|tryObserve|Observe a property of an object if possible|
|tryObserveArray|Observe an array property of an object if possible|



##Quirks

To support older browsers and the async nature of busybody, follow the following rules:
* Don't use `delete myObject.property`; use `busybody.del(myObject, "property")` instead.
* Don't use `myArray[2] = "something"` for `busybody.array` objects; use `myArray.replace(2, "something")` instead.
* To keep in line with [`Object.observe`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe) specs, and transition smoothly into it's usage, all observe callbacks are executed asynchronusly.