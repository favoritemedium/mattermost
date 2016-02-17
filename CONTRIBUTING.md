# Code Contribution Guidelines

Thank you for your interest in contributing to Mattermost. This guide provides an overview of important information for contributors to know. 

## Choose a Ticket

1. Review the list of [Good First Contribution](https://mattermost.atlassian.net/issues/?filter=10206) tickets listed in Jira
    - You are welcome to work on any ticket, even if it is assigned, so long as it is not yet marked "in progress"
    - (optional) Comment on the ticket that you're starting so no one else inadvertently duplicates your work

2. These projects are intended to be a straight forward first pull requests from new contributors
  - If you don't find something appropriate for your interests, please see the full list of tickets [Accepting Pull Requests](https://mattermost.atlassian.net/issues/?filter=10101)
  - Also, feel free to fix bugs you find, or items in GitHub issues that the core team has approved, but not yet added to Jira
  - For feature ideas, please discuss on the [feature ideas forum](http://www.mattermost.org/feature-requests/) before beginning work

3. If you have any questions at all about a ticket, there are several options to ask: 
  1. Start a topic in the [Mattermost forum](http://forum.mattermost.org/)
  2. Join the [Mattermost core team discussion](https://pre-release.mattermost.com/signup_user_complete/?id=rcgiyftm7jyrxnma1osd8zswby) and post in the "Tickets" channel

## Install Mattermost and set up a Fork

1. Follow [developer setup instructions](https://github.com/mattermost/platform/blob/master/doc/developer/Setup.md) to install Mattermost

2. Create a branch with <branch name> set to the ID of the ticket you're working on, for example ```PLT-394```, using command: 

```
git checkout -b <branch name>
```

## Programming and Testing 

1. Please review the [Mattermost Style Guide](doc/developer/Style-Guide.md) prior to making changes

   To keep code clean and well structured, Mattermost uses ESLint to check that pull requests adhere to style guidelines for React. In addition all code is run through the official go formatter tool gofmt. Code will need to follow Mattermost's React style guidelines and the golang official style guide in order to pass the automated build tests when a pull request is submitted. 
   
2. Please make sure to thoroughly test your change before submitting a pull request

   For any changes to text processing, please run the text processing tests found in the [/tests](https://github.com/mattermost/platform/tree/master/doc/developer/tests) folder in GitHub.
   
   Please review the ["Fast, Obvious, Forgiving" experience design principles](http://www.mattermost.org/design-principles/) for Mattermost and check that your feature meets the criteria. Also, for any changes to user interface or help text, please read the changes out loud, as a quick and easy way to catch any inconsitencies

3. For new server-side funcitonality, please include test cases that verify the code performs as you have intended


## Submitting a Pull Request 

1. Please add yourself to the Mattermost [approved contributor list](https://docs.google.com/spreadsheets/d/1NTCeG-iL_VS9bFqtmHSfwETo5f-8MQ7oMDE5IUYJi_Y/pubhtml?gid=0&single=true) prior to submitting by completing the [contributor license agreement](http://www.mattermost.org/mattermost-contributor-agreement/). 

2. When you submit your pull request please make it against `master` and include the Ticket ID at the beginning of your pull request comment, followed by a colon

  - For example, for a ticket ID `PLT-394` start your comment with:  `PLT-394:`. See [previously closed pull requests](https://github.com/mattermost/platform/pulls?q=is%3Apr+is%3Aclosed) for examples
  - All pull requests must have a ticket ID so the issue can be tracked and tested properly. If there is no existing ticket in Jira, please [file a bug in GitHub](http://www.mattermost.org/filing-issues/) or a [feature idea you're proposing to implement](http://www.mattermost.org/feature-requests/) so a Jira ticket can be created

3. Please include a comment on the pull request describing the changes
   
   For new features visible in the UI, please make sure there are enough details explaining how the feature is expected to work. This will be used when testing and writing help documentation. 

4. Once submitted, your pull request will be checked via an automated build process and will be reviewed by at least two members of the Mattermost core team, who may either accept the PR or follow-up with feedback. It would then get merged into `master` for the next release
  1. If the build fails, check the error log to narrow down the reason
  2. Sometimes one of the multiple build tests will randomly fail due to issues in Travis CI so if you see just one build failure and no clear error message it may be a random issue. Add a comment so the reviewer for your change can re-run the build for you, or close the PR and re-submit and that typically clears the issue

5. If you've included your mailing address in Step 1, you'll be receiving a [Limited Edition Mattermost Mug](http://forum.mattermost.org/t/limited-edition-mattermost-mugs/143) as a thank you gift after your first pull request has been accepted
