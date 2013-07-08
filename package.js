Package.describe({
  summary: "Cucumber tests for meteor"
});

Npm.depends({"cucumber":"0.3.0"});

Package.on_use(function (api) {
  if(process.env.NODE_ENV === 'production') return;

  var fs = Npm.require('fs'),
  // hack #1: needs the .js or the Npm facade won't find it
  bundler = Npm.require('cucumber/bundler.js');
  // hack #2: we shouldn't need to write a temp file, since Meteor is just going to read it and cache it in memory
  //   -- but the package API doesn't expose the necessary function to add a "resource"
  fs.writeFileSync(this.source_root + '/cucumber.js', bundler().bundle());
  api.add_files(['cucumber.js', 'runner.js'], 'client');
  api.add_files(['support.js'], 'server');
});

Package.register_extension('feature', function(bundle, srcPath, servePath, where) {
  if(process.env.NODE_ENV === 'production') return;
  if(where !== 'client') return;

  var fs = Npm.require('fs');
  var feature_name = servePath.substr(1);
  var match = feature_name.match(/^(features\/)?(.*)\.feature$/);
  if(match)
    feature_name = match[2];

  console.log('found feature file: ' + srcPath + ' (' + feature_name + ')');
  bundle.add_resource({
    type: 'js',
    data: 'if(Cucumber.features === undefined) Cucumber.features = {}; Cucumber.features["' + feature_name +
          '"] = ' + JSON.stringify(fs.readFileSync(srcPath, 'utf-8')) + ';',
    path: servePath,
    where: where
  });
});
