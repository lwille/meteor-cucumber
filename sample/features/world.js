if(this.Cucumber) {
  Cucumber.World.created = function(callback) {
    console.log('a new World is born');

    callback(this);
  };
}
