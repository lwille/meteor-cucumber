if(this.Cucumber) {
  Cucumber.add_steps(function() {
    this.defineStep(/I have an account/, function() {
      console.log('I have an account!');
    });
  });
}
