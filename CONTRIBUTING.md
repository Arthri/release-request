# Contributing
See https://arthri.github.io/Belp/Contributing

## Release Request Title RegEx
The default regex matches `Release v1.2`, `Release v1.2.3`, `Release v1.2.3.4`, as well was `Release v1.2-alpha`, `Release v1.2.3-beta`, `Release v1.2.3.4-rc`. It does not match one-field versions such as `Release v3` or five(or more)-field versions such as `Release v1.2.3.4.5`.

There a few places where this RegEx is used,
- In all workflows in this repository.
- README.md

Any updates to the regex must be reflected on all the places it is used.
