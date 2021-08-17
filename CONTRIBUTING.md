# Contributing to the Hedera SDK for JavaScript

Thank you for your interest in contributing the Hedera SDK for JavaScript!

We appreciate your interest in helping us and the rest of our community. We welcome bug reports, feature requests, and code contributions.

__Jump To:__

* [Bug Reports](#bug-reports)
* [Feature Requests](#feature-requests)
* [Code Contributions](#code-contributions)

## Bug Reports

Bug reports are accepted through the [Issues][issues] page.

The [bug][label-bug] label is used to track bugs.

### Before Submitting a Bug Report

Before submitting a bug report, please do the following:

1. Do a search through the existing issues to make sure it has not already been reported. If you find that the bug has already been raised, please give it a +1 to help us to decide which issues we prioritise.

2. If possible, upgrade to the latest release of the SDK. It's possible the bug has already been fixed in the latest version. We will do our utmost to maintain backwards compatibility between patch version releases, so that you can be confident that your application will continue to work as expected with the newer version.

If you have completed these steps and you need to submit a bug report, please read the guidelines below.

### Submitting a Bug Report

Please ensure that your bug report contains the following:

* A short, descriptive title. Other community members should be able to understand the nature of the issue by reading this title.
* A succinct, detailed description of the problem you're experiencing. This should include:
  * Expected behaviour of the SDK and the actual behaviour exhibited.
  * Any details of your application development environment that may be relevant.
  * If applicable, the exception stack-trace.
  * If you are able to create one, include a [Minimal Working Example][mwe] that reproduces the issue.
* [Markdown][markdown] formatting as appropriate to make the report easier to read; for example use code blocks when pasting a code snippet or exception stack-trace.

## Feature Requests

Feature requests are also submitted through the [Issues][issues] page.

As with Bug Reports, please do a search of the open requests first before submitting a new one to avoid duplicates. If you do find a a feature request that represents your suggestion, please give it a +1.

__NOTE:__ If you intend to implement this feature, please submit the feature request *before* working on any code changes. This will allow members on the SDK team to assess the idea, discuss the design with you and ensure that it makes sense to include such a feature in the SDK.

Feature requests are labeled as [enhancements][label-enhancement].

### Submitting a Feature Request

Open an [issue][issues] with the following:

* A short, descriptive title. Other community members should be able to understand the nature of the issue by reading this title.
* A detailed description of the the proposed feature. Explain why you believe it should be added to the SDK. Illustrative example code may also be provided to help explain how the feature should work.
* [Markdown][markdown] formatting as appropriate to make the request easier to read.
* If you plan to implement this feature yourself, please let us know that you'd like to the issue to be assigned to you.

## Code Contributions

Code contributions to the SDK are handled using [Pull Requests][pull-requests]. Please keep the following in mind when considering a code contribution:

* The SDK is released under the [Apache 2.0 License][license].

   Any code you submit will be released under this license.

* For anything other than small or quick changes, you should always start by reviewing the [Issues][issues] page to ensure that the nobody else is already working on the same issue.

  If you're working on a bug fix, check to see whether the bug has already been reported. If it has but no one is assigned to it, ask one of the maintainers to assign it to you before beginning work. If you're confident the bug hasn't been reported yet, create a new [Bug Report](#bug-reports) and ask us to assign it to you.

  If you are thinking about adding entirely new functionality, open a [Feature Request](#feature-requests) or get in touch with us on [Discord](discord) to ask for feedback first before beginning work; this is to ensure that nobody else is already working on the feature (or another similar feature) and to confirm that it makes sense for such functionality to be included in the SDK.
* All code contributions must be accompanied with new or modified tests that verify that the code works as expected; i.e. that the issue has been fixed or that the functionality works as intended.

### Pull Request Readiness

Before submitting your pull request, refer to the pull request readiness checklist below:

* [ ] Includes tests to exercise the new behaviour
* [ ] Code is documented, especially public and user-facing constructs
* [ ] Local run of `mvn checkstyle:check` and `mvn spotbugs:check` succeed
* [ ] Git commit message is detailed and includes context behind the change
* [ ] If the change is related to an existing Bug Report or Feature Request, please include its issue number

To contribute, please fork the GitHub repository and submit a pull request to the `main` branch.

### Getting Your Pull Request Merged

All Pull Requests must be approved by at least one member of the SDK team before it can be merged in. The members only have limited bandwidth to review Pull Requests so it's not unusual for a Pull Request to go unreviewed for a few days, especially if it's a large or complex one. After a couple of weeks, if you haven't received any feedback regarding your Pull Request from the SDK team, feel free to contact us on [Discord](discord) to ask for a review.

## Getting in Contact

* Join us in our [Discord][discord] channel; there you can engage with the Hedera team and other developers and enthusiasts.

[license]: https://github.com/hashgraph/hedera-sdk-js/blob/main/LICENSE
[mwe]: https://en.wikipedia.org/wiki/Minimal_Working_Example
[markdown]: https://guides.github.com/features/mastering-markdown/
[issues]: https://github.com/hashgraph/hedera-sdk-js/issues
[pull-requests]: https://github.com/hashgraph/hedera-sdk-js/pulls
[label-bug]: https://github.com/hashgraph/hedera-sdk-js/labels/bug
[label-enhancement]: https://github.com/hashgraph/hedera-sdk-js/labels/enhancement
[discord]: https://hedera.com/discord
