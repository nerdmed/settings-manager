Package.describe({
    summary: "Adding a easy to use settings manager"
});

Package.on_use(function(api, where) {
    api.use(['reactive-dict', 'underscore', 'ejson', 'deps', 'ui'], 'client');
    api.add_files(['lib/settings.js'], 'client');

    if (api.export)
        api.export('SettingsManager');
});

Package.on_test(function(api) {
    api.use(['underscore', 'ejson', 'deps', 'settings-manager', 'spacebars', 'tinytest', 'test-helpers']);
    api.add_files(['tests/basictests.js'], 'client');
})