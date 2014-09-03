Package.describe({
	summary: "Adding a easy to use settings manager",
	version: "0.3.0",
	git: "https://github.com/nerdmed/settings-manager.git"
});


Package.onUse(function(api) {
	api.versionsFrom('METEOR@0.9.0.1');
	api.use(['reactive-dict', 'underscore', 'ejson', 'deps', 'ui'], 'client');
	api.add_files(['lib/settings.js'], 'client');
	api.export('SettingsManager');
});


Package.on_test(function(api) {
	api.use(['underscore', 'ejson', 'deps', 'nerdmed:settings-manager', 'spacebars', 'tinytest', 'test-helpers']);
	api.add_files(['tests/basictests.js'], 'client');
})