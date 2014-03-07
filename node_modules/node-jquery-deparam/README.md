node-jquery-deparam
===================
Modified version of Duncan Wong his jquery-deparam. Removed jQuery dependency and only targeting node as deployment target. Modified coercion behaviour. Coercion is done by default now, with an option to disable it.

Extracted $.deparam from Ben Alman's [jquery-bbq](https://github.com/cowboy/jquery-bbq/) with license info included.
Deparam is the inverse of jquery's [$.param method](http://api.jquery.com/jQuery.param/).  It takes a parameterized querystring and converts it back into an object.  For example (from the included tests):

```javascript
var paramStr = 'a[]=4&a[]=5&a[]=6&b[x][]=7&b[y]=8&b[z][]=9&b[z][]=0&b[z][]=true&b[z][]=false&b[z][]=undefined&b[z][]=&c=1';
var paramsObj = {
    a: [4,5,6],
    b:{
        x:[7],
        y:8,
        z:[9,0,true,false,undefined,'']
    },
    c:1
};

deparam(paramStr).should.deep.equal(paramsObj);

```

Install
==============
```
npm install git://github.com/edwardsmit/node-jquery-deparam.git
```

Usage
===============
```
var deparam = require('node-jquery-deparam');
var paramsObj = deparam(querystring);
```

License
===============
MIT
