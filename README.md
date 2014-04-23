## PDX-Parks

Find a park near you.

Uses civic apps & Open Layers Api for mapping.

## Running

* `npm install`
* `npm run build-css` (There is a bug in libsass with placeholder derivatives, you
may have to run this with the ruby sass cli. I am consciously checking in the compiled
css for this reason)
* `node server.js`
* `open 127.0.0.1:3000`

## Notes:
bower_components are checked in because of a bug with heroku trying to install
from bower from a commit SHA.

## Contributing
There are a bunch of todos, just check the issues.