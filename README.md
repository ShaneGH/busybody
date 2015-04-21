# busybody
###An Object.observe library that gets all up in yo business
busybody supports non Object.observe environments as far back as IE 9

##Index
<a href="#ObservingAValue">Observe</a>

##Usage
<h3 id="ObservingAValue">Observing a value</h3>
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
|property|String|The property|No|
|callback|property|The callback to execute|No|
|context|Function|The "this" in the callback|No|
|options|Object|Options for the callback|Yes|
|options.useRawChanges|Boolean|Default: false. Use the change objects from the Array.observe as arguments|Yes|
|options.evaluateOnEachChange|Boolean|Default: false. Evaluate once for each change rather than on an amalgamation of changes|Yes|
|options.evaluateIfValueHasNotChanged|Boolean|Default: false. Evaluate if the oldValue and the newValue are the same|Yes|
|options.activateImmediately|Boolean|Default: false. Activate the callback now, meaning it could get changes which were applied before the callback was created|Yes|

###Observing a path
```javascript

// object which are not observalbe in a path cannot be observed.
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