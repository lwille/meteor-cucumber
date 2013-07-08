window.CUCUMBER_URL = '/++cucumber';

Meteor.startup(function() {
    if(location.pathname == CUCUMBER_URL) {
        console.log('running cucumber tests');
    }
});
