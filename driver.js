var _ = require('underscore'), usb = require('node-usb/usb.js');

var launcher = usb.find_by_vid_and_pid(0x2123, 0x1010)[0];

if (!launcher) {
  console.error('Launcher not found - make sure your Thunder Missile Launcher is plugged in to a USB port');
} else {
  var launcherInterface = launcher.interfaces[0];
  if (launcherInterface.isKernelDriverActive()) {
    launcherInterface.detachKernelDriver();
  }
  launcherInterface.claim();
  console.log('Attached driver ...');
  process.on('exit', function () {
    console.log('Detaching driver ...');
    launcherInterface.release(function (data) {
      console.log('Driver detached: ' + data);
    });
  });
}

function execute(cmd, duration, callback) {
  if (launcher) {
    launcher.controlTransfer(0x21, 0x09, 0x0, 0x0, new Buffer([0x02, cmd, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      function (data) {
        if (_.isNumber(duration)) {
          if (!_.isFunction(callback) && cmd != 0x20) {
            callback = controller.stop;
          }
          setTimeout(callback, duration);
        }
        console.log("Executed " + cmd + ' for ' + duration);
      }
    );
  }
}

function call(callback) {
  (_.isFunction(callback) ? callback : controller.stop).call(this);
}

var controller = {};

controller.u = controller.up = function (duration, callback) {
  execute(0x01, duration, callback);
};

controller.d = controller.down = function (duration, callback) {
  execute(0x02, duration, callback);
};

controller.l = controller.left = function (duration, callback) {
  execute(0x04, duration, callback);
};

controller.r = controller.right = function (duration, callback) {
  execute(0x08, duration, callback);
};

controller.s = controller.stop = function (callback) {
  execute(0x20, callback);
};

controller.f = controller.fire = function (number, callback) {
  number = _.isNumber(number) && number >= 0 && number <= 4 ? number : 1;
  if (number == 0) {
    call(callback);
  } else {
    execute(0x10, 4500, function () {
      controller.fire(number - 1, callback);
    });
  }
};

controller.execute = function (commands, callback) {
  if (_.isString(commands)) {
    controller.execute(commands.split(','), callback);
  } else if (commands.length == 0) {
    call(callback);
  } else {
    var command = commands.shift();
    var number = command.length > 1 ? parseInt(command.substring(1)) : null;
    controller[command[0]].call(this, number, function () {
      controller.execute(commands, callback);
    });
  }
};

controller.reset = function (callback) {
  controller.execute('d2000,l8000', callback);
};

module.exports = controller;
