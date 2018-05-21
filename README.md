npm audit ci
======================

    Commandline utility which exit the process with code 1, for the given criteria of vulnerabilities

Useful to make CI build fail when vulnerabilities are found or use to send alert using another tool.

```
› npm-audit-ci --help                    
Options:
  --version        Show version number                                 [boolean]
  -l, --low        Exit even for low vulnerabilities  [boolean] [default: false]
  -m, --moderate   Exit only when moderate or above vulnerabilities
                                                      [boolean] [default: false]
  -h, --high       Exit only when high or above vulnerabilities
                                                      [boolean] [default: false]
  -c, --crititcal  Exit only for critical vulnerabilities
                                                       [boolean] [default: true]
  --help           Show help
```

License
-------
Please see [License](https://github.com/revathskumar/npm-audit-ci/License)

