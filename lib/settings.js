isFunction = function(funcToCheck) {
    var getType = {};
    return funcToCheck && getType.toString.call(funcToCheck) === '[object Function]';
}



Setting = function(name, manager) { // Settings 
    this.name = name;
    this.manager = manager;
    this._stop = false;
}

_.extend(Setting.prototype, {
    _beforeSet: function(old, n) {
        // console.log("beforeSet", old, n);
    },
    _afterSet: function(old, n) {
        // console.log("afterSet", old, n);
    },
    _onChange: function(old, n) {
        // console.log("onChange", old, n);
    },

    get: function() {
        return this.manager.reactiveDict.get(this.name);
    },

    getCss: function() {

        var value = this.manager.reactiveDict.get(this.name);
        var customCssResult = this._customCss(value);

        if (typeof value == "boolean") {
            if (value) {
                value = "on";
            } else {
                value = "off";
            }
        }

        if (value instanceof Array) {
            value = "arr-" + value.length;
        } else if (typeof value == "object") {
            value = "obj-" + _.keys(value).length
        }

        if (customCssResult) {
            return customCssResult;
        } else {
            return this.name + "-" + value
        }

    },
    _customCss: function(value) {
        return false;
    },

    set: function(val) {
        this.manager.reactiveDict.set(this.name, val);
    },

    cancel: function() {
        this._stop = true;
    }
})

SettingsManager = function(obj) {
    var self = this;
    this.name;
    this.reactiveDict = new ReactiveDict();
    var settings = this.settings = {}; // storage of all Settings
    this.fixed = false;

    if (typeof obj == "string") {
        this.name = obj;
    } else {
        if (obj.name) {
            this.name = obj.name;
        } else {
            throw new Meteor.Error(003, 'Error 003: You forgot to set a name for this Settings-Manager');
        }
    }

    if (typeof obj == "object") {
        if (obj.fixed) {
            this.fixed = obj.fixed;
        }
        // Create all Settings that was passed on init
        if (obj.settings) {
            _.each(obj.settings, function(name, i) {
                settings[name] = new Setting(name, self)
            })
        }
        // Run Initial Set 
        if (obj.init != undefined && typeof obj.init == "object") {
            self.set(obj.init);
        }
    }

    Handlebars.registerHelper(this.name, function() {
        var args = Array.prototype.slice.call(arguments);
        var cssString = self.getCss(args)
        return cssString;
    })





}


_.extend(SettingsManager.prototype, {


    _handleObject: function(key, obj) {
        var self = this;
        self._createValue(key);
        var notAllowed = ['onChange', 'afterSet', 'beforeSet', 'css'];
        var setters = _.pick(obj, notAllowed);
        var values = _.omit(obj, notAllowed);

        // apply Setters
        if ((_.keys(setters).length > 0)) {
            _.each(setters, function(fkt, setter) {
                self[setter](key, fkt);
            })
        }
        // expect only one value to be passed

        if ( !! values.value) { // check if value is presend 

            if (_.keys(values).length == 1) {
                self._setValue(key, values["value"])
            } else {

                // ERROR - value PRovided and other elements in object expect onChange, afterSet, beforeSet
            }
        } else { // no value is key is provided -> actual value object is the Value to save
            if (_.keys(values).length > 0) {

                self._setValue(key, values);
            }

        }
    },

    _applyValue: function(name, newValue) {
        var self = this;
        // console.log(key, newValue)
        if (newValue != null && typeof newValue === 'object' && !(newValue instanceof Array)) {
            return self._handleObject(name, newValue);
        }

        self._setValue(name, newValue);
    },

    _createValue: function(name) {
        var self = this;
        var setting = self.settings[name];

        if (!setting) {
            if (self.fixed) {
                throw new Meteor.Error(001, 'Error 001: You tried to set: ' + name + ' but it does not exist. If you want to do this remove fixed:true as a option');

            } else {
                setting = self.settings[name] = new Setting(name, self);
            }
        }

    },
    _setValue: function(name, newValue) {
        var self = this;
        if (newValue === undefined) throw new Meteor.Error(001, 'Error 002: You have to add an value to apply set - you tried to set UNDEFINED');
        self._createValue(name);
        var setting = self.settings[name];
        var oldValue = setting.get();
        var newVal = newValue;

        workResult(setting, oldValue, newVal, setting._beforeSet(oldValue, newVal), function(oldval, newval, result) { // xxx work of result in a different function to set new Values
            newVal = newval; // TODO is this needed?
            setting.set(newval);
        });


        // if Value changes
        if (!EJSON.equals(oldValue, newVal)) {
            setting._onChange(oldValue, newVal);
        }
        setting._afterSet(oldValue, newVal);
    },




    set: function(name, value) { // whoist this function to the top
        var self = this;
        var map;
        var setting;
        var oldValue;
        // if called with one argument its a hash map 
        if (arguments.length == 1) {
            map = name;
        }

        // if a map is givin work of every value, - each (value, key, obj) -   
        if (map) {
            _.each(map, function(newValue, key, obj) {
                self._applyValue(key, newValue);
            })
        } else {
            if (name != undefined && value != undefined) {
                self._applyValue(name, value);
            }
        }
        self._afterSetAll();

    },

    get: function(name) {
        var self = this;

        var array = null;
        if (name instanceof Array) array = name;

        if (!array && name) {
            return self.settings[name].get()
        }

        if (array) {
            return _.pick(self.settings, array);
        }

        var retObj = {};
        _.each(self.settings, function(value, key) {
            retObj[key] = self.settings[key].get();
        })

        return retObj;
    },

    getCss: function(name) {
        var self = this;

        var array = null;
        if (name instanceof Array) array = name;

        var retArray = [];

        if (array) {
            var selected = _.pick(self.settings, array);
            _.each(selected, function(value, key) {
                retArray.push(self.settings[key].getCss());
            })
        }

        var cssSring = retArray.join(" ");
        return cssSring;
    },
    _afterSetAll: function() {

    },

    css: function(name, fkt) {
        var self = this;
        if (fkt == undefined) {
            if (typeof name == "object") {
                var cssMap = name;
                _.each(cssMap, function(fkt, key) {
                    self.settings[key]._customCss = fkt;
                })
            }
        } else {
            console.log(name, self.settings);
            self.settings[name]._customCss = fkt;
        }

    },

    beforeSet: function(name, fkt) {
        var self = this;
        self.settings[name]._beforeSet = fkt;
    },

    afterSet: function(name, fkt) {
        var self = this;
        if (fkt == undefined) {
            if (isFunction(name)) {
                self._afterSetAll = name;
                return;
            }
        }
        self.settings[name]._afterSet = fkt;
    },

    onChange: function(name, fkt) {
        var self = this;
        self.settings[name]._onChange = fkt;
    }
});



workResult = function(setting, oldval, newval, result, fkt) {
    // works of result and start new function

    var newValue = newval;
    if (result != undefined) {
        newValue = result;
    }
    if (setting._stop) {
        setting._stop = false;
        return;
    }
    if (isFunction(fkt)) {
        fkt(oldval, newValue, result);
    }
}