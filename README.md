Prerequisites: [usb missile launcher][1], [gcc-4.3][2], [pkg-config][3], [libusb-dev][4]

Quick Start:

    var launcher = require('node-thunder-drive');

    // control methods
    launcher.up([duration, callback])
    launcher.down([duration, callback])
    launcher.left([duration, callback])
    launcher.right([duration, callback])
    launcher.stop([callback])
    launcher.fire([number, callback]) // if no number provided, it is treated as 1

    // helper methods
    launcher.execute(command, [callback])
    launcher.reset([callback])

The duration parameter tells how long to execute the action in milliseconds e.g.launcher.up(2000) would move the turret up for 2 seconds
If duration parameter is zero, one 'tick' of that action would be performed e.g. launcher.up(0) would move the turret up one 'tick'
If duration parameter is missing, the action would be executed infinitely e.g. launcher.up() would move the turret up continuously

Complex sequence of actions can be "programmable" e.g.

    launcher.up(1000, function() {
      launcher.down(200, function() {
        launcher.left(5000, function() {
          launcher.fire(2, function(){
            launcher.stop(function() {
               console.log('Finished executing up for 1s, down for 0.2s, left for 5s and then fired 2 missiles');
            });
          });
        });
      });
    });

can be simply written as:

    launcher.execute('u1000,d200,l5000,f2', function() {
      console.log('Finished executing up for 1s, down for 0.2s, left for 5s and then fired 2 missiles');
    });

A helper method reset() is provided which moves the turret to a parked/zero position.

See an [example usage][5]

  [1]: http://www.dreamcheeky.com/thunder-missile-launcher
  [2]: http://stackoverflow.com/questions/10480654/std-gnu0xoption-for-macos
  [3]: http://manpages.ubuntu.com/manpages/hardy/man1/pkg-config.1.html
  [4]: http://ubuntuforums.org/showthread.php?t=1537201
  [5]: http://github.com/pathikrit/node-thunder-webui

