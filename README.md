# busybody
###An Object.observe library that gets all up in yo business
busybody supports non Object.observe environments as far back as IE 9

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