var _ = require('underscore'), launcher;

try {
  var usb = require('node-usb/usb.js');
  launcher = usb.find_by_vid_and_pid(0x2123, 0x1010)[0];
  if (!launcher) {
    console.error('Launcher not found :(');
  }
  var launcherInterface = launcher.interfaces[0];
  if (launcherInterface.isKernelDriverActive()) {
    launcherInterface.detachKernelDriver();
  }
  launcherInterface.claim();
  console.log('Attached rocket-adapter ...');
  process.on('exit', function () {
    console.log('Detaching rocket-adapter ...');
    launcherInterface.release(function (data) {
      console.log('Rocket-adapter detached: ' + data);
    });
  });
} catch (err) {
  console.error(err.stack);
}

function execute(cmd, duration, callback) {
  if (!launcher) {
    return;
  }

  try {
    launcher.controlTransfer(0x21, 0x09, 0x0, 0x0, new Buffer([0x02, cmd, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      function (data) {
        duration = _.isNumber(duration) ? duration : 0;
        if (duration >= 0) {
          if (!_.isFunction(callback) && cmd != 0x20) {
            callback = controller.stop;
          }
          setTimeout(callback, duration);
        }
        console.log("Executed " + cmd + ' for ' + duration);
      }
    );
  } catch (err) {
    console.error(err.stack);
  }
}

var controller = {
  up: function (duration, callback) {
    execute(0x01, duration, callback);
  },

  down: function (duration, callback) {
    execute(0x02, duration, callback);
  },

  left: function (duration, callback) {
    execute(0x04, duration, callback);
  },

  right: function (duration, callback) {
    execute(0x08, duration, callback);
  },

  stop: function (callback) {
    execute(0x20, callback);
  },

  reset: function (callback) {
    controller.execute('d2000,l8000', callback);
  },

  fire: function (number, callback) {
    if (number == 0) {
      if (!_.isFunction(callback)) {
        callback = controller.stop;
      }
      callback.call(this);
      return;
    }
    if (!number || number < 1 || number > 4) {
      number = 1;
    }
    execute(0x10, 4500, function () {
      controller.fire(number - 1, callback);
    });
  },

  execute: function (commands, callback) {
    if (_.isString(commands)) {
      controller.execute(commands.split(','), callback);
      return;
    }

    if (!_.isArray(commands)) {
      throw "commands must be either a comma separated string or a string array";
    }

    if (commands.length == 0) {
      if (_.isFunction(callback)) {
        callback.call(this);
      }
      return;
    }

    var command = commands.shift();
    var duration = command.length > 1 ? parseInt(command.substring(1)) : null;
    var nextCallback = function () {
      controller.execute(commands, callback);
    };
    switch (command[0]) {
      case 'u':
        controller.up(duration, nextCallback);
        break;
      case 'd':
        controller.down(duration, nextCallback);
        break;
      case 'l':
        controller.left(duration, nextCallback);
        break;
      case 'r':
        controller.right(duration, nextCallback);
        break;
      case 'f':
        controller.fire(duration, nextCallback);
        break;
      case 'z':
        controller.reset(nextCallback);
        break;
      default:
        console.warn('Invalid command: ' + command);
    }
  }
};

module.exports = controller;
