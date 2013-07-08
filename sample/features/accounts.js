if(this.Cucumber) {
  Cucumber.addSteps(function() {
    console.log('defining steps for account');
    this.defineStep(/I have an account/, function(callback) {
      console.log('I have an account!');
      callback();
    });
  });
}
