// simple 
mySettings = new SettingsManager({
    settings: ["lights", "door", "window"] // Array of Setting names
});

Tinytest.add("Basics - basic set and get", function(test) {
    mySettings.set("lights", true);
    test.equal(mySettings.get("lights"), true, "Expected to be equal");
});

Tinytest.add("Basics - basic set and get array", function(test) {

    // Array
    mySettings.set("door", [true, true, false]);
    test.equal(mySettings.get("door"), [true, true, false], "Expected to be equal");
    console.log(mySettings.get());
    // console.log(mySettings.get()) GET ARRAY

});

Tinytest.add("Basics - basic set and get object", function(test) {
    // Object
    var windowObj = {
        kitchen: "open",
        sleep: "closed",
        sleep2: 50
    };
    mySettings.set("window", windowObj);
    test.equal(mySettings.get("window"), windowObj, "Expected to be equal");


})

Tinytest.add("Basics - dynamic set and get", function(test) {
    mySettings = null;
    mySettings = new SettingsManager({
        dynamic: true
    });
    mySettings.set("foo", 2);
    test.equal(mySettings.get("foo"), 2, "Expected to be equal");


})




Tinytest.add("Basics - basic set and get + with init", function(test) {
    mySettings = null;

    mySettings = new SettingsManager({
        settings: ["lights", "door", "window"],
        init: {
            lights: true,
            door: [true, true, false],
            window: {
                kitchen: "open",
                sleep: "closed",
                sleep2: 50
            }
        }
    });

    test.equal(mySettings.get("lights"), true, "Expected to be equal");
});

Tinytest.add("Basics - basic set and get array + with init", function(test) {

    // Array
    test.equal(mySettings.get("door"), [true, true, false], "Expected to be equal");



});

Tinytest.add("Basics - basic set and get object + with init", function(test) {
    // Object
    test.equal(mySettings.get("window"), {
        kitchen: "open",
        sleep: "closed",
        sleep2: 50
    }, "Expected to be equal");

})


Tinytest.add("Advanced - Multiset", function(test) {
    mySettings.set({
        lights: true,
        door: "open",
        window: "closed"
    });

    test.equal(mySettings.get("lights"), true, "Expected to be equal");
    test.equal(mySettings.get("door"), "open", "Expected to be equal");
    test.equal(mySettings.get("window"), "closed", "Expected to be equal");
})




Tinytest.add("Advanced - Callbacks", function(test) {
    var hasChanged = false;
    var actValue;
    console.log("LOL", mySettings.get("lights"))
    mySettings.set("lights", true);
    console.log("LOL", mySettings.get("lights"))

    // console.log(mySettings);
    mySettings.beforeSet("lights", function(oldVal, newVal) {
        actValue = mySettings.get("lights");
        test.equal(actValue, true, "Expected to be equal");
        if (typeof newVal != 'boolean') this.cancel();
    })


    // after set to false
    mySettings.onChange("lights", function(oldVal, newVal) {
        // console.log("ONCHANGE")
        actValue = mySettings.get("lights");
        test.equal(actValue, false, "Expected to be equal");
        hasChanged = true;
    })

    mySettings.afterSet("lights", function(oldVal, newVal) {
        // console.log("AFTERSET")
        test.equal(actValue, false, "Expected to be equal");
        test.equal(hasChanged, true, "Expected to be equal");
        actValue = mySettings.get("lights");
    })

    mySettings.set("lights", false);

})

Tinytest.add("Advanced - MultiSet + Callbacks", function(test) {
    var multicallback1 = false;
    var multicallback2 = false;

    mySettings.set({
        lights: {
            value: "foo",
            beforeSet: function(oldVal, newVal) {
                // return true;
            },
            afterSet: function() {
                multicallback1 = true;
                return "works";
            }
        },
        door: {
            test: 1,
            test2: 2,
            test3: [1, 2, 3, 4],
            test4: {
                1: 2
            },

            beforeSet: function(oldVal, newVal) {
                // return true;
            },
            afterSet: function() {
                multicallback2 = true;
                return "works";
            }

        }
    });
    // test above set of value
    test.equal(mySettings.get("lights"), "foo", "Expected to be equal");
    test.equal(mySettings.get("door"), {
            test: 1,
            test2: 2,
            test3: [1, 2, 3, 4],
            test4: {
                1: 2
            }
        },
        "Expected to be equal");

    // test callbacks
    test.equal(multicallback1, true, "Expected to be equal");
    test.equal(multicallback2, true, "Expected to be equal");


})

Tinytest.add("Advanced - Callbacks beforeSet cancel with stop", function(test) {
    mySettings.set("lights", true);
    mySettings.beforeSet("lights", function(oldval, newval) {
        this.cancel();
    });
    // console.log(mySettings);
    mySettings.set("lights", false);

    test.equal(mySettings.get("lights"), true, "Expected to be equal");

})

Tinytest.add("Advanced - Callbacks beforeSet cancel with false", function(test) {
    mySettings.set("lights", true);
    mySettings.beforeSet("lights", function(oldval, newval) {
        this.cancel();
    });
    mySettings.set("lights", false);

    test.equal(mySettings.get("lights"), true, "Expected to be equal");

})

Tinytest.add("Advanced - Callbacks beforeSet change the value", function(test) {
    // reset value  and before set
    mySettings.beforeSet("lights", function(oldval, newval) {});
    mySettings.set("lights", false);
    test.equal(mySettings.get("lights"), false, "Expected to be equal");


    mySettings.beforeSet("lights", function(oldval, newval) {
        newval = "baz";
        return newval;

    });

    mySettings.set("lights", false);
    test.equal(mySettings.get("lights"), "baz", "Expected to be equal");

})

Tinytest.add("Advanced - Callbacks beforeSet block the value with stop in object", function(test) {
    // reset value  and before set
    mySettings.beforeSet("lights", function(oldval, newval) {});
    mySettings.set("lights", false);
    test.equal(mySettings.get("lights"), false, "Expected to be equal");



    mySettings.beforeSet("lights", function(oldval, newval) {
        newval = "baz";
        this.cancel();
    });

    mySettings.set("lights", false);
    test.equal(mySettings.get("lights"), false, "Expected to be equal");

})