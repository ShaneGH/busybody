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
|property|property|property|property|




		///<summary>Observe changes to a property </summary>
		///<param name="property" type="String">The property</param>
		///<param name="callback" type="Function">The callback to execute</param>
		///<param name="context" type="Any" optional="true">The "this" in the callback</param>
		///<param name="options" type="Object" optional="true">Options for the callback</param>
		///<param name="options.useRawChanges" type="Boolean">Default: false. Use the change objects from the Array.observe as arguments</param>
		///<param name="options.evaluateOnEachChange" type="Boolean">Default: false. Evaluate once for each change rather than on an amalgamation of changes</param>
		///<param name="options.evaluateIfValueHasNotChanged" type="Boolean">Default: false. Evaluate if the oldValue and the newValue are the same</param>
		///<param name="options.activateImmediately" type="Boolean">Default: false. Activate the callback now, meaning it could get changes which were applied before the callback was created</param>





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