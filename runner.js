window.CUCUMBER_URL = '/++cucumber';

steps_callbacks = [];
Cucumber.addSteps = function(callback) {steps_callbacks.push(callback);};

function World(callback) {
  this.created(callback);
}
Cucumber.World = World.prototype;
Cucumber.World.created = function(callback) {callback(this);};

function supportCode() {
  this.World = World;

  var context = this;
  //console.log('Setting up support code, ' );
  _.each(steps_callbacks, function(callback) {callback.call(context);});
}

listeners = [];
Cucumber.addListener = function(callback) {listeners.push(callback);};

function Listener() {
  this.results = [];
}

Listener.prototype.real_hear = function(event, callback) {
  switch(event.getName()) {
    case 'BeforeFeature':
      this.feature = event.getPayloadItem('feature');
      break;

    case 'BeforeScenario':
      this.currentScenario = event.getPayloadItem('scenario');
      break;

    case 'BeforeStep':
      this.currentStep = event.getPayloadItem('step');
      break;

    case 'StepResult':
      var result = {
        step: this.currentStep,
        scenario: this.currentScenario
      };
      var stepResult = event.getPayloadItem('stepResult');
      if (stepResult.isSuccessful()) {
        result.status = 'passed';
      } else if (stepResult.isPending()) {
        result.status = 'pending';
      } else if (stepResult.isUndefined()) {
        result.status = 'undefined';
      } else if (stepResult.isSkipped()) {
        result.status = 'skipped';
      } else {
        var error = stepResult.getFailureException();
        var errorMessage = error.stack || error;
        result.status = 'failed';
        result.error_message = errorMessage;
      }
      this.results.push(result);
      break;
  }
  callback();
};

Listener.prototype.hear = function(event, callback) {
  var listeners_remaining = listeners.slice();
  listeners_remaining.reverse();
  var self = this;
  function next_listener() {
    if(listeners_remaining.length)
      listeners_remaining.pop().call(self, event, next_listener);
    else
      self.real_hear(event, callback);
  }
  next_listener();
};

Cucumber.run = function() {
  console.log('running cucumber tests');
  var results = {};
  for(var feature_name in Cucumber.features) {
    console.log('Feature: ' + feature_name);
    var cucumber = Cucumber(Cucumber.features[feature_name], supportCode);
    var listener = new Listener();
    cucumber.attachListener(listener);
    cucumber.start(function() {
      results[feature_name] = listener.results;
      results[feature_name].feature = listener.feature;
    });
  }
  return results;
};

Meteor.startup(function() {
  if(location.pathname == CUCUMBER_URL) {
    Cucumber.run_results = Cucumber.run();
  }
});
