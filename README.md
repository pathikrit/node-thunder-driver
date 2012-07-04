Prerequisites: [usb missile launcher][1], [gcc-4.3][2], [pkg-config][3], [libusb-dev][4]

Note: There is an experimental port of this library that uses [gcc-4.2][6] in [this branch][7]

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

duration parameter tells how long to execute the action in milliseconds e.g.launcher.up(2000) executes the up action for 2 seconds. launcher.up() would do 1 'tick' up motion. If a negative number is passed in for duration, it is treated as infinite e.g. launcher.up(-9) would continuously move the launcher up.

Complex sequence of actions can be "programmable":

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

The cleaner way of doing same thing as above it to simply do:

    launcher.execute('u1000,d200,l5000,f2', function() {
      console.log('Finished executing up for 1s, down for 0.2s, left for 5s and then fired 2 missiles');
    });

A helper method reset() is provided which moves the turret to a parked/zero position. The shortcut command is 'z' e.g. this is a valid command sequence 'z,l100,r200,f3'

See an [example usage][5]

  [1]: http://www.dreamcheeky.com/thunder-missile-launcher
  [2]: http://stackoverflow.com/questions/10480654/std-gnu0xoption-for-macos
  [3]: http://manpages.ubuntu.com/manpages/hardy/man1/pkg-config.1.html
  [4]: http://ubuntuforums.org/showthread.php?t=1537201
  [5]: http://github.com/pathikrit/node-thunder-webui
  [6]: http://stackoverflow.com/questions/1165361/setting-gcc-4-2-as-the-default-compiler-on-mac-os-x-leopard
  [7]: https://github.com/pathikrit/node-thunder-driver/compare/master...gcc4.2_compat
