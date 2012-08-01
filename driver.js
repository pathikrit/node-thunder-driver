(function () {
  'use strict';

  var DEVICE = {
    ID: {
      VENDOR : 0x2123,
      PRODUCT: 0x1010
    },

    CMD: {
      UP   : 0x02,
      DOWN : 0x01,
      LEFT : 0x04,
      RIGHT: 0x08,
      FIRE : 0x10,
      STOP : 0x20,
      RESET: 'l8000,d2000'
    },

    MISSILES: {
      NUMBER         : 4,
      RELOAD_DELAY_MS: 4500
    }
  };

  var _ = require('underscore'), usb = require('node-usb/usb.js');

  var launcher = usb.find_by_vid_and_pid(DEVICE.ID.VENDOR, DEVICE.ID.PRODUCT)[0];

  if (!launcher) {
    throw 'Launcher not found - make sure your Thunder Missile Launcher is plugged in to a USB port';
  }

  var launcherInterface = launcher.interfaces[0];
  if (launcherInterface.isKernelDriverActive()) {
    launcherInterface.detachKernelDriver();
  }
  launcherInterface.claim();
  process.on('exit', launcherInterface.release);

  function signal(cmd, duration, callback) {
    launcher.controlTransfer(0x21, 0x09, 0x0, 0x0, new Buffer([0x02, cmd, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
        function (data) {
          if (_.isNumber(duration)) {
            _.delay(_.isFunction(callback) ? callback : controller.stop, duration);
          }
        }
    );
  }

  function trigger(callback, p1, p2) {
    return function () {
      callback(p1, p2);
    };
  }

  var controller = {};

  controller.up = controller.u = function (duration, callback) {
    signal(DEVICE.CMD.UP, duration, callback);
  };

  controller.down = controller.d = function (duration, callback) {
    signal(DEVICE.CMD.DOWN, duration, callback);
  };

  controller.left = controller.l = function (duration, callback) {
    signal(DEVICE.CMD.LEFT, duration, callback);
  };

  controller.right = controller.r = function (duration, callback) {
    signal(DEVICE.CMD.RIGHT, duration, callback);
  };

  controller.stop = controller.s = function (callback) {
    if (_.isFunction(callback) && callback !== controller.stop) {
      signal(DEVICE.CMD.STOP, 0, callback);
    } else {
      signal(DEVICE.CMD.STOP);
    }
  };

  controller.fire = controller.f = function (number, callback) {
    number = _.isNumber(number) && number >= 0 && number <= DEVICE.MISSILES.NUMBER ? number : 1;
    if (number === 0) {
      controller.stop(callback);
    } else {
      signal(DEVICE.CMD.FIRE, DEVICE.MISSILES.RELOAD_DELAY_MS, trigger(controller.fire, number - 1, callback));
    }
  };

  controller.park = controller.p = function (callback) {
    controller.execute(DEVICE.CMD.RESET, callback);
  };

  controller.execute = function (commands, callback) {
    if (_.isString(commands)) {
      controller.execute(commands.split(','), callback);
    } else if (commands.length === 0) {
      controller.stop(callback);
    } else {
      var command = commands.shift(), func = command.length > 0 ? controller[command[0]] : null;
      if (_.isFunction(func)) {
        var next = trigger(controller.execute, commands, callback);
        if (func === controller.park || func === controller.stop) {
          func(next);
        } else {
          var number;
          try {
            number = parseInt(command.substring(1), 10);
          } catch (ignore) {
            number = null;
          }
          func(number, next);
        }
      } else {
        console.warn('Ignoring bad command: ' + command);
        controller.execute(commands, callback);
      }
    }
  };

  module.exports = controller;
})();
