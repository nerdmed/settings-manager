# Settings Manager

With this package you can easily manage settings in your application. It works similar to Sessions with some Hooks and a CSS Manager for your templates.
The reactive hooks will enable you to easily work with complex behaviours and conditonal variables.


Contributing:
* Add your ideas to improve this package as issues
* Please report bugs, i will fix them asap
* If you want to contribute test your changes before doing pull requests


##Create new SettingsManager
To create a SettingsManager you only have to do the following:

	mySettings = new SettingsManager("mySettings");

##Set and get a value - just like with Session

	mySettings.set("lights", true);
	mySettings.get("lights");
	 -> true

##Create fixed settings for better control 
For having more control and limiting your avaliable Settings you can add the fixed option.
It woll not be possible to add new settings to this SettingsManager.

**Example**

	mySettings = new SettingsManager({
		name: "mySettings"
		fixed: true,
		settings:["lights","door","window"] // Array of fixed Settings
	});



## Create with inital Set
You can Initially Set your values on creation. To do so provide an init key and set a Object. You can use MultiSet and MultiSet with Callbacks. Read ob to understand how they work.

**Example**
		
	mySettings = new SettingsManager({
		name: "mySettings",
		settings:["lights","door","window"],
		fixed : true,
		init : {
			lights: false,
			door : "closed",
			window : "closed"
			}
	});

## Save Settings 
You can either save the settings to the localstorage or to the user profile. To do so just add the following option.

	### Saving to the Local Storage 
	You can use the following options: session (temporary) , persistent

		mySettings = new SettingsManager({
			name: "mySettings",
			save: "persistent"
		});

		1. Session (Temporary)
		  * Guess what. It matches current Meteor implementation
		  * Settings are set to init values after a page reload

		2. Persistent ReactiveDict
		  * Settings are stored in the localstorage until you reset or change them


	##


## Raw Template Helper
You can define a raw helper name it will return the settings inside an object or as a value if its only one
	
	mySettings = new SettingsManager({
		name: "mySettings",
		rawHelper: "getSettings"
	});

**Template**

	  <div id="overview" class="{{getSettings "lights" "door"}}"></div>

## CSS Manager

### Default CSS-Output
Often you want your interface to react on changes in your Settings. For this you can easly use the provided Template Helper. Just place your Manager Name as a template helper and pass it the settings as Strings. 

**Example**

	mySettings = new SettingsManager({
		name: "mySettings"
		init : {
			lights: false,
			door : "closed",
			window : "closed"
			}
	});



**Template**

	<template name="room">
	  <div id="overview" class="{{mySettings "lights" "door" "window"}}"></div>
	</template>

By default you will get the following HTML:

	<div id="overview" class="lights-off door-closed window-closed" ></div>

Depending on the type of the Value one of the following pattern is used by default:

Settings Name    | Value         | CSS Class     |
---------------- | ------------- | ------------- |
name             | true          | name-on       |
name             | false         | name-off      | 
name             | xyz123        | name-xyz      | 
name             | Object        | name-obj-length   | 
name             | Array         | name-arr-length   | 

For Objects and Arrays its makes sense to implement your own CSS output - depending on the content.
To do so you can use the following Pattern:

### Custom CSS-Output
To change the CSS class to fit your needs you can do the following:

**Example**

	mySettgins.css("light", function(newVal){
		if(newVal == true){
			return "lights-are-on"
		}else{
			return "lights-are-off"
		}
	})

You can also use this inside the Multi Set pattern below.

## Advanced 

### Multi Set
You can change more then one Setting at once. To do so just provide an Object with your setting names and the values.

**Example**
	
	mySettings.set({
		lights: true,
		door : "open",
		window : "closed"
	})




## Hooks

Every Hook needs the name of the Setting and a callback function. Every function is called with the old and the new Value as parameters.

The order of execution is the following: 

	1. beforeSet
	2. onChange
	3. afterSet

### beforeSet(name, func)
The beforeSet Hook is called before the Value is applied. Here is a good place to do error checking or to change the value as you like.
If you return a value it will be passed to onChange and afterSet. If you call this.cancel() the changed will not get applied.

**Arguments**

_name:_
The Name of the setting you want to hook on.

func:
A callback function that will get the old and the new values as parameters.

_Return (Optional):_
You can change the value that will get applied by returning a new value

**Example**

	mySettings.beforeSet("light", function(oldVal,newVal){
		// this will execute before the value is actualy set
		// you can cancel with this.cancel();

		// if you return a value this will be applied
	})

**Example 2**

To change the value before applying it you have to return the new value. If you dont return anything it will just take the value that was set. If you want to stop in a certain case you can just run this.cancel() anywhere in your before Hook.
The follwing example will change the value before applying it and running onChanged and afterSet.
	
	// if its after 18:00 Clock the lights will always be set to true
	mySettings.beforeSet("light", function(oldVal,newVal){
		var light = newVal;
		if(new Date().getHours() < 18) light = false;
		if(new Date().getHours() > 18) light = true;
		return light;
	})

	// if its after 22:00 Clock the lights can not be changed anymore
	mySettings.beforeSet("light", function(oldVal,newVal){
		var light = newVal;
		var blockLights = false;
		if(new Date().getHours() > 18) light = true;
		if(new Date().getHours() > 22) this.cancel();
		return light;
	})

### onChange(name, callback)
This will only execute if the value of your object changes. For now it uses EJSON.equals to compare.
	
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


### MultiSet + Hooks + CSS

You can set values, provide hooks, and change CSS at once. To do so provide an Object with your setting names and an object that contains a value key. If not the remaining Object will be set as the Value.

**Example**

	mySettings.set({
		lights: {
			value : true,
			beforeSet : function(oldVal, newVal){
				if(typeof newVal === "boolean")
				return;
				else this.cancel();
			},
			afterSet: function(oldVal, newVal){
				console.log(this.name + "has been changed to" + newVal)
			},
			css : function(newVal){
				if(newVal == true){
					return "lights-are-on"
				}else{
					return "lights-are-off"
				}

			}
		},
		door : {
			value : "closed",
			beforeSet : function(oldVal, newVal){
				if(typeof newVal === "String")
				return;
				else this.cancel();
				}
			},
	})


## Reactivity 
For now the reactivity is exactly working like when using Sessions. So you will get reactive Variables.



