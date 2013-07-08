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
        scenario: this.currentScenario,
        feature: this.feature
      };
      var stepResult = event.getPayloadItem('stepResult');
      if(stepResult.isSuccessful()) {
        result.status = 'passed';
      } else if(stepResult.isPending()) {
        result.status = 'pending';
      } else if(stepResult.isUndefined()) {
        result.status = 'undefined';
      } else if(stepResult.isSkipped()) {
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

Cucumber.run = function(callback) {
  console.log('running cucumber tests');
  var results = {};
  var started = 0, all_started = false;

  for(var feature_name in Cucumber.features) {
    console.log('Feature: ' + feature_name);
    started++;
    var cucumber = Cucumber(Cucumber.features[feature_name], supportCode);
    var listener = new Listener();
    cucumber.attachListener(listener);
    cucumber.start(function() {
      results[feature_name] = listener.results;
      if(all_started && --started === 0)
        callback(results);
    });
  }

  if(started === 0) return callback(results);
  all_started = true;
};

Meteor.startup(function() {
  if(location.pathname == CUCUMBER_URL) {
    var callback;
    if(_.isFunction(Cucumber.run.after))
      callback = Cucumber.run.after;
    else
      callback = function(results) {Cucumber.run_results = results;};
    Cucumber.run(callback);
  }
});

///////////////////////////////////////////////////////////////////////////
// Then some niceties :-)

Cucumber.MeteorUtils = {
  logSnippetsToConsole: function(event, callback) {
    if(event.getName() == 'StepResult') {
      var stepResult = event.getPayloadItem('stepResult');
      if(stepResult.isUndefined()) {
        var builder = Cucumber.SupportCode.StepDefinitionSnippetBuilder(this.currentStep);
        console.log('Undefined step "' + this.currentStep.getName() +
                    '". You can define it by pasting this code in one of your .js files:');
        console.log(builder.buildSnippet());
      }
    }
    callback();
  },

  digestResults: function(results) {
    if(results === undefined) results = Cucumber.run_results;
    return _.groupBy(_.flatten(_.values(results)), 'status');
  }
};
