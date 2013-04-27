Package.describe({
  summary: "Cucumber tests for meteor"
});

Npm.depends({"cucumber":"0.3.0"});

Package.on_use(function (api) {
  var fs = Npm.require('fs'),
  bundler = Npm.require('cucumber/bundler.js');
  fs.writeFileSync('packages/cucumber/cucumber.js', bundler().bundle());
  api.add_files(['cucumber.js'], 'client');
});

