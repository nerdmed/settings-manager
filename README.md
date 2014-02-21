With this package you can easily manage settings in your application, look at the callbacks to see what you can do

##Manual Install Meteor Package
* Add the following to your smart.json inside the project folder
```
{
  "packages": {
    "settings-manager": {
             "git": " git@github.com:nerdmed/meteor-settings.git"
         }
  }
}
```
* Run

```
mrt add settings-manager
```


##Create new SettingsManager
To create new settings you have to create an instance of SettingsManager and pass an Array of all the Settings you want to manage.

	mySettings = new SettingsManager({
		settings:["lights","door","window"] // Array of Setting names
	});

##Set and get a value 

	mySettings.set("lights", true);
	mySettings.get("lights");
	 -> true

## Create with inital Set
You can Initially Set your values on creation. To do so provide an init key and set a Object. You can use MultiSet and MultiSet with Callbacks. Read ob to understand how they work.

**Example**
		
	mySettings = new SettingsManager({
	    	
		settings:["lights","door","window"],
		init : {
			lights: false,
			door : "closed",
			window : "closed"
			}
	    	});



## Advanced Setting
You can set your Values in different ways. Check it out:

### Multi Set

You can change more then one Setting at once. To do so just provide an Object with your setting names and the values.

**Example**
	
	mySettings.set({
		lights: true,
		door : "open",
		window : "closed"
	})




## Callbacks

Every Callback needs the name of the Setting and a callback function. Every function is called with the old and the new Value.

The order of execution is the following: 

	1. beforeSet
	2. onChange
	3. afterSet

### beforeSet(name, func)
The beforeSet callback is called before the Value is applied. Here is a good place to do error checking or to change the value as you like.

**Arguments**

_name:_
The Name of the setting you want to hook on.

func:
A callback function that will get the old and the new values as parameters.

_Return:_
You can change the value that will get applied by returning a new value

**Example**

	mySettings.beforeSet("light", function(oldVal,newVal){
		// this will execute before the value is actualy set
		// if this returns false the value will not be set, so you can do error checking 
	})

**Example 2**
To change the value before applying it you have to return an object with a value propaty. If you also want to stop in this case you can return an object with a value and a stop propaty.
The follwing example will change the value before applying it and checking onChanged and afterSet.
	
	// if its after 18:00 Clock the lights will always be set to true
	mySettings.beforeSet("light", function(oldVal,newVal){
		var light = newVal;
		if(new Date().getHours() > 18) light == true;
		return {
			value : light,
		}
	})

	// if its after 22:00 Clock the lights will can not be changed anymore
	mySettings.beforeSet("light", function(oldVal,newVal){
		var light = newVal;
		var blockLights = false;
		if(new Date().getHours() > 18) light == true;
		if(new Date().getHours() > 22) blockLights == true;
		return {
			value : true,
			stop : blockLights
		}
	})

### onChange(name, callback)
This will only Execute if the value of your object changes. For now it uses EJSON.equals to compare 
	
**Arguments**

_name:_
The Name of the setting you want to hook on.

func:
A callback function that will get the old and the new values as parameters.
	
**Example**

	mySettings.onChange("light", function(oldVal,newVal){
		// this will execute only if the value changes
	})

	
### afterSet(name, callback)
**Arguments**

_name:_

The Name of the setting you want to hook on.

func:
A callback function that will get the old and the new values as parameters.

**Example**

	mySettings.afterSet("light", function(oldVal,newVal){
		// this will execute after the value is set propaly
		// a good place for further execution
	})

### MultiSet + Callbacks

You can Set Values and provide a callback at once. To do so provide an Object with your setting names and an object. Make sure that your Object contains an value key. If not the remaining Object will be set as the Value.

**Example**

	mySettings.set({
		lights: {
			value : true,
			beforeSet : function(oldVal, newVal){
				if(typeof newVal === "boolean")
				return true;
				else return false;
			}
		},
		door : {
			value : "closed",
			beforeSet : function(oldVal, newVal){
				if(typeof newVal === "String")
				return true;
				else return false;
				}
			},
	})

## Reactivity 
You want to have your settings updated automaticly everywhere inside your app after it has been changed. But sometimes you want to cache the values of your settings, to reduce function calls. For that you can easily wrap your cached variables inside a Deps.autorun(); callback. Now everytime you change the value - your cached value will also change. Look at this example.
	
	var lightCached;

	Deps.autorun(function(){
		lightCached = mySettings.get("light") // caches the value for the actual scope
	})
	
	for (var i=0; i<1000;i++){ 
		console.log(lightCached)
	}


