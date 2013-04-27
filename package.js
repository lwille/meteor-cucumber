Package.describe({
  summary: "Cucumber tests for meteor"
});

Npm.depends({"cucumber":"0.3.0"});

Package.on_use(function (api) {
  var fs = Npm.require('fs'),
  // hack #1: needs the .js or the Npm facade won't find it
  bundler = Npm.require('cucumber/bundler.js');
  // hack #2: we shouldn't need to write a temp file, since Meteor is just going to read it and cache it in memory
  //   -- but the package API doesn't expose the necessary function to add a "resource"
  // hack #3: there's no way to get the relative path of this (package.js) file, so we assume it's in the
  //   normal place
  fs.writeFileSync('packages/cucumber/cucumber.js', bundler().bundle());
  api.add_files(['cucumber.js'], 'client');
});

