<a target="_blank" href="https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb">![Try it now in CWS](https://raw.github.com/GoogleChrome/chrome-app-samples/master/tryitnowbutton.png "Click here to install this sample from the Chrome Web Store")</a>

Get it in the chrome web store:
https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb

Chrome Web Server - an HTTP web server for Chrome (chrome.sockets)

===
Basic usage:

var app = new chrome.WebApplication(options)

options: object, with keys
- handlers: array of handlers,
- renderIndex: boolean (whether to render index.html if in directory)
- optBackground: whether to run even if the window is closed
- optAutoStart: whether to auto start when chrome starts
- port: int (port to listen on)

Handlers
    var handlers = [
        ['/favicon.ico',FavIconHandler],
        ['/stream.*',StreamHandler],
        ['/static/(.*)',StaticHandler],
        ['.*', DefaultHandler]
    ]

handlers is an array of 2 element arrays where the first item is a regular expression for the URL and the second is the handler class, which should extend BaseHandler

```
    function StaticHandler() {
        this.disk = null
        chrome.runtime.getPackageDirectoryEntry( function(entry) { this.disk = entry }.bind(this) )
        BaseHandler.prototype.constructor.call(this)
    }
    var FavIconHandlerprototype = {
        get: function(path) {
            // USE HTML5 filesystem operations to read file
            
        },
        onReadFile: function(evt) {
            if (evt.error) {
                this.write('disk access error')
            } else {
                this.write(evt)
            }
        }
    }
    _.extend(StaticHandler.prototype,
             StaticHandlerprototype,
             BaseHandler.prototype
            )
```

todo: create small example pages


====
Building
====
Unfortunately there is a build process if you want to run this from source directly because I am using a Polymer (polymer-project.org) user interface. There is a bower.json in the polymer-ui folder and you will need to install node+npm+bower and then run bower install from that folder. Oh, and then you will need to "Refactor for CSP" (chrome apps do not allow inline scripts), the way I do this is using https://chrome.google.com/webstore/detail/chrome-dev-editor-develop/pnoffddplpippgcfjdhbmhkofpnaalpg (open the folder and right click and select refactor for CSP)

I'm now using a script that can do this (look in polymer-ui/build.sh. You'll need to npm install -g vulcanize crisper)

====

Get it in the chrome web store:
https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb

The default behavior right now is very simple. You choose a directory
to serve static content. It is now able to stream large files and
handle range requests. It also sets mime types correctly.

Here is an example project based on it:
https://chrome.google.com/webstore/detail/flv-player/dhogabmliblgpadclikpkjfnnipeebjm

====

MIT license

I wrote this because the example app provided by google would lock and
hang and had all sorts of nasty race conditions. Plus it would not
stream large files or do range requests, HEAD requests, etc, etc.

The design of this is inspired heavily by to the Python Tornado Web
library. In this as well as that, you create an "app" which registers
handlers. Then under the hood it will accept connections, create an
HTTPConnection object, and that has an associated IOStream object
which handles the nonblocking read/write events for you.


See CREDITS file