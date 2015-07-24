Package.describe({
	summary: "Adding a easy to use settings manager",
	version: "0.4.0",
	git: "https://github.com/nerdmed/settings-manager.git"
});


Package.on_use(function(api) {
	api.versionsFrom('1.0');
	api.use(['reactive-dict', 'underscore', 'ejson', 'tracker', 'ui'], 'client');
	api.add_files(['lib/settings.js'], 'client');
	api.export('SettingsManager');
});


Package.on_test(function(api) {
	api.use(['underscore', 'ejson', 'tracker', 'flowkey:settings-manager', 'spacebars', 'tinytest', 'test-helpers']);
	api.add_files(['tests/basictests.js'], 'client');
})