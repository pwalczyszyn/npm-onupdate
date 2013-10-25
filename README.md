npm-onupdate
============

CLI for [npm-onupdate.info](http://npm-onupdate.info), a [NPM](https://npmjs.org/) registry email notification service.

The server side source code be found [here](https://github.com/pwalczyszyn/npm-onupdate-server).

###INSTALLATION

    > npm install -g npm-onupdate

###USAGE

####Adding new package alert

    $ npm-onupdate add express

####Adding multiple package alerts

    $ npm-onupdate add 'express ejs'

####Adding alerts for all dependencies from package.info file in current dir

    $ npm-onupdate add

####Removing package alert

    $ npm-onupdate rm express

####Removing multiple package alerts

    $ npm-onupdate rm 'express ejs'

####Listing all registered alerts

    $ npm-onupdate ls

####Get account info

    $ npm-onupdate account info

####Change account password

    $ npm-onupdate account password

####Delete account

    $ npm-onupdate account delete

####Logout

    $ npm-onupdate account logout

###License

  MIT
