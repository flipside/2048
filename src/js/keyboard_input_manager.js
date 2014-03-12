function KeyboardInputManager() {
  this.events = {};

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // vim keybindings
    76: 1,
    74: 2,
    72: 3,
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3  // A
  };

  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }

      if (event.which === 32) self.restart.bind(self)(event);
    }
  });

  var retry = document.getElementsByClassName("retry-button")[0];
  retry.addEventListener("click", this.restart.bind(this));

  // Listen to swipe events
  var gestures = [Hammer.DIRECTION_UP, Hammer.DIRECTION_RIGHT,
                  Hammer.DIRECTION_DOWN, Hammer.DIRECTION_LEFT];

  var gameContainer = document.getElementsByClassName("game-container")[0];
  var handler       = Hammer(gameContainer, {
    drag_block_horizontal: true,
    drag_block_vertical: true
  });

  handler.on("swipe", function (event) {
    event.gesture.preventDefault();
    mapped = gestures.indexOf(event.gesture.direction);

    if (mapped !== -1) self.emit("move", mapped);
  });

  var directionButtons = document.getElementsByClassName("direction-button");

  Hammer(directionButtons[0]).on("tap", function (e) {
    e.preventDefault();
    self.emit("move", 0);
  });
  Hammer(directionButtons[1]).on("tap", function (e) {
    e.preventDefault();
    self.emit("move", 1);
  });
  Hammer(directionButtons[2]).on("tap", function (e) {
    e.preventDefault();
    self.emit("move", 2);
  });
  Hammer(directionButtons[3]).on("tap", function (e) {
    e.preventDefault();
    self.emit("move", 3);
  });

  if (window.DeviceOrientationEvent) {
    // var alpha = document.getElementById('alpha');
    var beta = document.getElementById('beta');
    var gamma = document.getElementById('gamma');
    var tiltDirection = document.getElementById('tilt-direction');
    var tilt = document.getElementById('tilt');
    var neutralBeta, neutralGamma, b, g, db, dg;
    var tiltMoved = false;
    var tiltTimeout;

    var tiltMove = function (direction) {
      if (!tiltMoved) {
        tiltMoved = true;
        tiltTimeout = setTimeout(function () {
          tiltMoved = false;
        }, 600);
        self.emit('move', direction);
      }
    };

    var deviceorientation = function (e) {
      // alpha.textContent = e.alpha;
      b = e.beta;
      g = e.gamma;
      if (neutralBeta === undefined) {
        neutralBeta = b;
        neutralGamma = g;
      }
      db = neutralBeta - b;
      dg = neutralGamma - g;

      if (dg > 20) {
        tiltDirection.textContent = 'left';
        tiltMove(3);
      } else if (dg < -20) {
        tiltDirection.textContent = 'right';
        tiltMove(1);
      } else if (db > 15) {
        tiltDirection.textContent = 'up';
        tiltMove(0);
      } else if (db < -15) {
        tiltDirection.textContent = 'down';
        tiltMove(2);
      }

      beta.textContent = db;
      gamma.textContent = dg;
      // tilt([e.beta, e.gamma]);
    };

    var tilted = Hammer(tilt, {
      hold_timeout: 0
    });
    tilted.on('hold', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.gesture.preventDefault();
      e.gesture.stopPropagation();
      tilt.textContent = 'hold';
      neutralBeta = undefined;
      neutralGamma = undefined;
      window.addEventListener('deviceorientation', deviceorientation, true);
    });

    tilted.on('release', function (e) {
      e.preventDefault();
      tilt.textContent = 'release';
      window.removeEventListener('deviceorientation', deviceorientation, true);
    });


  }

};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};
