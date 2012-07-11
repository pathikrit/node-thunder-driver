Prerequisites: 
[usb missile launcher](http://www.dreamcheeky.com/thunder-missile-launcher), 
[gcc-4.3](http://stackoverflow.com/questions/10480654/std-gnu0xoption-for-macos), 
[pkg-config](http://manpages.ubuntu.com/manpages/hardy/man1/pkg-config.1.html), 
[libusb-dev](http://ubuntuforums.org/showthread.php?t=1537201)

Quick Start:

```javascript
var launcher = require('node-thunder-driver');

// control methods
launcher.up([duration, callback])
launcher.down([duration, callback])
launcher.left([duration, callback])
launcher.right([duration, callback])
launcher.stop([callback])
launcher.fire([number, callback]) // if no number provided, it is treated as 1

// helper methods
launcher.execute(command, [callback])
launcher.park([callback])
```

If duration is positive, the action is executed for duration milliseconds e.g.launcher.up(2000) would move the turret up for 2 seconds
If duration is zero or negative, one 'tick' of that action would be performed e.g. launcher.up(0) would move the turret up one 'tick'
If duration is missing, the action would be executed infinitely e.g. launcher.up() would move the turret up continuously

Complex sequence of actions can be "programmable" e.g.

```javascript
launcher.up(1000, function() {
  launcher.down(200, function() {
    launcher.left(5000, function() {
      launcher.fire(2, function() {
        launcher.stop(function() {
           console.log('Finished executing up for 1s, down for 0.2s, left for 5s and then fired 2 missiles');
        });
      });
    });
  });
});
```

can be simply written as:

```javascript
launcher.execute('u1000,d200,l5000,f2', function() {
  console.log('Finished executing up for 1s, down for 0.2s, left for 5s and then fired 2 missiles');
});
```

A helper method park() is provided which moves the turret to a parked/zero position.
The shortcut for park is 'p' e.g. this is a valid launch sequence - 'p,l1000,f'

See a [sample project](http://github.com/pathikrit/node-thunder-webui) that uses this library

