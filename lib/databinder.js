module.exports = DataBinder;

var ee = require('event-emitter');

function DataBinder( objectid ) {
  var emitter = ee({});

  var lastValues = {};
  var self = {};

  self.onModelChange = function(cb){
    emitter.on(objectid, function(data){
      if(!data.fromView) {
        cb(data.name, data.value, data.sender);
      }
    });
  };
  self.onModelPropChangeListener = function(name, cb){
    self.onModelChange(function(_name, value, sender){
      if(Array.isArray(name) && name.indexOf(_name) !== -1 || _name === name) {
        cb(value, _name, sender);
      }
    });
  };
  self.onModelPropChange = function(name, cb, opts){
    self.onModelPropChangeListener(name, cb);
    if(opts && opts.noinit) {
      return;
    }
    (Array.isArray(name) && name || [name]).forEach(function(n){
      lastValues[n] !== undefined && cb(lastValues[n], n);
    });
  };
  self.onViewChange = function(cb){
    emitter.on(objectid, function(data){
      if(data.fromView) {
        cb(data.name, data.value, data.sender);
      }
    });
  };
  self.onViewElChangeListener = function(name, cb){
    self.onViewChange(function(_name, value, sender){
        if(Array.isArray(name) && name.indexOf(_name) !== -1 || _name === name) {
          cb(value, _name, sender);
        }
    });
  };
  self.onViewElChange = function(name, cb, opts){
    self.onViewElChangeListener(name, cb);
    if(opts && opts.noinit) {
      return;
    }
    (Array.isArray(name) && name || [name]).forEach(function(n){
      lastValues[n] !== undefined && cb(lastValues[n], n);
    });
  };

  var emit  = function(name, value, fromView, sender, force){
    // break if both are NaNs as it does not match on equality
    if(value+'' === 'NaN' && lastValues[name]+'' === 'NaN') {
      return;
    }

    if(force || lastValues[name] !== value) {
      lastValues[name] = value;
      emitter.emit(objectid, {name: name, value: value, fromView: fromView, sender: sender});
    }
  };

  self.viewChanged = function(name, value, sender, force){
    emit(name, value, true, sender, force);
  };
  self.modelChanged = function(name, value, sender, force){
    emit(name, value, false, sender, force);
  };

  return self;
}
