# Contributing
See https://arthri.github.io/Belp/Contributing

## Release Request Title RegEx
The current default regex matching release request titles is `^Release (v[0-9]+\.[0-9]+(\.[0-9]+(\.[0-9]+)?)?(-[a-zA-Z0-9_]+)?)$`. It matches `Release v1.2`, `Release v1.2.3`, `Release v1.2.3.4`, as well was `Release v1.2-alpha`, `Release v1.2.3-beta`, `Release v1.2.3.4-rc`. It does not match one-field versions such as `Release v3` or five(or more)-field versions such as `Release v1.2.3.4.5`.

There are three places where this RegEx is used,
- In this document.
- In all workflows in this repository.

Any updates to the RegEx must be reflected on all the places it is used.
