var should = require('chai').should();
var deparam = require('../node-jquery-deparam');

describe('node-jquery-deparam', function(){
    it('loads', function(){
        require('../node-jquery-deparam').should.be.a('function');
    });
    it('deserializes strings', function(){
        deparam('prop=sillystring').prop.should.be.a('string');
    });
    it('deserializes arrays', function(){
        deparam('prop[]=one&prop[]=two').prop.should.be.an('array');
    });
    it('deserializes objects', function(){
        deparam('prop[prop2]=somestring').prop.should.be.an('object');
    });
    it('deserializes booleans', function(){
        deparam('prop=false').prop.should.be.a('boolean');
    });
    it('deserializes numbers', function(){
        deparam('prop=1234').prop.should.be.a('number');
    });
    it('deserializes booleans into strings when without coercion', function(){
        deparam('prop=false', false).prop.should.be.a('string');
    });
    it('deserializes numbers into strings when without coercion', function(){
        deparam('prop=1234', false).prop.should.be.a('string');
    });
    it('returns an empty object when provided querystring is not a string', function(){
      deparam(123).should.be.empty;
    });
    it('returns an empty object when no querystring is provided', function(){
      deparam().should.be.empty;
    });
    describe('bbq specs', function(){
        it('deserializes 1.4-style params', function(){
            var paramStr = 'a[]=4&a[]=5&a[]=6&b[x][]=7&b[y]=8&b[z][]=9&b[z][]=0&b[z][]=true&b[z][]=false&b[z][]=undefined&b[z][]=&c=1';
            var paramsObj = { a:[4,5,6], b:{x:[7], y:8, z:[9,0,true,false,undefined,'']}, c:1 };
            deparam(paramStr).should.deep.equal(paramsObj);
        });
        it('deserializes pre-1.4-style params without coercion', function(){
            var paramStr = 'a=1&a=2&a=3&b=4&c=5&c=6&c=true&c=false&c=undefined&c=&d=7';
            var paramsObj = { a:['1','2','3'], b:'4', c:['5','6','true','false','undefined',''], d:'7' };
            deparam(paramStr, false).should.deep.equal(paramsObj);
        });
        it('deserializes pre1.4-style params with coercion', function(){
            var paramStr = 'a=1&a=2&a=3&b=4&c=5&c=6&c=true&c=false&c=undefined&c=&d=7';
            var paramsObj = { a:[1,2,3], b:4, c:[5,6,true,false,undefined,''], d:7 };
            deparam(paramStr).should.deep.equal(paramsObj);
        });
    });
    describe('Should work correctly with encoded characters', function(){
      it('deserializes and decodes accented characters iso8859 ', function(){
        deparam('par=t%e9l%e9+club+').par.should.equal('télé club ');
      });
      it('deserializes and decodes accented characters UTF-8 ', function(){
        deparam('par=t%C3%A9l%C3%A9%20club%20').par.should.equal('télé club ');
      });
    });
});

