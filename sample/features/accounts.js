if(this.Cucumber) {
  Cucumber.addSteps(function() {
    console.log('defining steps for account');
    this.Given(/I have an account/, function(callback) {
      console.log('I have an account!');
      callback.pending();
    });
  });
}
