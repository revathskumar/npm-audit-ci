npm audit ci  [![Build Status](https://travis-ci.org/revathskumar/npm-audit-ci.svg?branch=master)](https://travis-ci.org/revathskumar/npm-audit-ci)
======================

    Commandline utility which exit the process with code 1, for the given criteria of vulnerabilities

Useful to make CI build fail when vulnerabilities are found or use to send alert using another tool.


### Usage

```
npm install -g npm-audit-ci
```

```
› npm-audit-ci --help                    
Options:
  --version       Show version number                                  [boolean]
  -l, --low       Exit even for low vulnerabilities   [boolean] [default: false]
  -m, --moderate  Exit only when moderate or above vulnerabilities
                                                      [boolean] [default: false]
  -h, --high      Exit only when high or above vulnerabilities
                                                      [boolean] [default: false]
  -c, --critical  Exit only for critical vulnerabilities
                                                       [boolean] [default: true]
  -r, --report    Show npm audit report               [boolean] [default: false]
  --help          Show help                                            [boolean]
```

License
-------
Please see [License](https://github.com/revathskumar/npm-audit-ci/blob/master/License)

