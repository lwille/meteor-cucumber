window.CUCUMBER_URL = '/++cucumber';

Cucumber._steps_callbacks = [];
Cucumber.add_steps = function(callback) {Cucumber._steps_callbacks.push(callback);};

function World(callback) {
  this.created(callback);
}
Cucumber.World = World.prototype;
Cucumber.World.created = function(callback) {callback(this);};

function support_code() {
  this.World = World;

  var context = this;
  _.each(Cucumber._steps_callbacks, function(callback) {callback.call(context);});
}

Cucumber.run = function() {
  console.log('running cucumber tests');
  for(var feature_name in Cucumber.features) {
    console.log('Feature: ' + feature_name);
    var cucumber = Cucumber(Cucumber.features[feature_name], support_code);
    cucumber.start(console.log);
  }
};

Meteor.startup(function() {
  if(location.pathname == CUCUMBER_URL) {
    Cucumber.run();
  }
});
