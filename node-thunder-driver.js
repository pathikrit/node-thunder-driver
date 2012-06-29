var launcher;

function acquireLauncher() {
  if (launcher) {
    return;
  }
  try {
    var usb = require('node-usb/usb.js');
    launcher = usb.find_by_vid_and_pid(0x2123, 0x1010);
    if (!launcher) {
      console.error('Launcher not found :(');
      return;
    }
    launcher = launcher[0];
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
}

function execute(cmd, duration, callback) {
  acquireLauncher();
  if (launcher) {
    try {
      launcher.controlTransfer(0x21, 0x09, 0x0, 0x0, new Buffer([0x02, cmd, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
        function (data) {
          if (!duration) {
            duration = 0;
          }
          if (callback) {
            setTimeout(callback, duration);
          }
          console.log("Executed " + cmd + ' for ' + duration);
        }
      );
    } catch (err) {
      console.error(err.stack);
    }
  }
  return controller;
}

function insertStop(callback) {
  return function () {
    controller.stop();
    if (callback && callback != controller.stop) {
      callback.call();
    }
  }
}

var controller = {

  up: function (duration, callback) {
    execute(0x01, duration, insertStop(callback));
  },

  down: function (duration, callback) {
    execute(0x02, duration, insertStop(callback));
  },

  left: function (duration, callback) {
    execute(0x04, duration, insertStop(callback));
  },

  right: function (duration, callback) {
    execute(0x08, duration, insertStop(callback));
  },

  stop: function (callback) {
    execute(0x20, callback);
  },

  reset: function (callback) {
    controller.execute('d2000,l8000', callback);
  },

  fire: function (number, callback) {
    if (number == 0) {
      insertStop(callback).call();
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
    if (typeof commands == 'string' || commands instanceof String) {
      controller.execute(commands.split(','), callback);
      return;
    }

    if (commands.length == 0) {
      insertStop(callback).call();
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
