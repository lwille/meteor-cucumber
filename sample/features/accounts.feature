Feature: accounts
    We use Meteor's accounts and accounts-ui packages for authentication.

    Scenario: register an account
        When I click "Sign in"
        And I click "Create account"
        And write a sample email address in the "Email" field
        And write "foo.bar" in the "Password" field
        And I click "Create account"
        Then I'm logged in
        And my email is the sample email address
        And the page body contains the sample email address

    Scenario: log in
        Given I have an account
        When I click "Sign in"
        And write my email in the "Email" field
        And write my password in the "Password" field
        And I click "Sign in"
        Then I'm logged in
        And the page body contains my email

    Scenario: log out
        Given I'm logged in
        When I click the link containing my email
        And I click "Sign out"
        Then I'm not logged in
        And the page body contains "Sign in"
