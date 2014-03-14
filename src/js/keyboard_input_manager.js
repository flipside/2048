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
  retry.addEventListener("touchstart", this.restart.bind(this));


  // var xPos = document.getElementById('beta');
  // var yPos = document.getElementById('gamma');


  // Listen to swipe events
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("game-container")[0];
  var gameWidth = gameContainer.clientWidth;
  var gameHeight = gameContainer.clientHeight;

  var getQuadrant = function (x, y) {
    var t1 = gameWidth * y - gameHeight * x > 0;
    var t2 = -gameWidth * y - gameHeight * (x - gameWidth) > 0;
    if (t1 && t2) {
      // left
      self.emit('move', 3);
    } else if (!t1 && t2) {
      // up
      self.emit('move', 0);
    } else if (!t1 && !t2) {
      // right
      self.emit('move', 1);
    } else {
      // down
      self.emit('move', 2);
    }
  };

  gameContainer.addEventListener("touchstart", function (event) {
    if (event.touches.length > 1) return;

    touchStartClientX = event.touches[0].clientX;
    touchStartClientY = event.touches[0].clientY;
    event.preventDefault();
  });
  gameContainer.addEventListener("touchmove", function (event) {
    event.preventDefault();
    // xPos.textContent = event.touches[0].pageX - gameContainer.offsetLeft;
    // yPos.textContent = event.touches[0].pageY - gameContainer.offsetTop;
  });
  gameContainer.addEventListener("touchend", function (event) {
    if (event.touches.length > 0) {
      return;
    }
    var dx = event.changedTouches[0].clientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = event.changedTouches[0].clientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 15) {
      // (right : left) : (down : up)
      self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    } else {
      getQuadrant(event.changedTouches[0].pageX - gameContainer.offsetLeft,
                  event.changedTouches[0].pageY - gameContainer.offsetTop);
    }
  });

/*  var directionButtons = document.getElementsByClassName("direction-button");

  directionButtons[0].addEventListener("touchstart", function (e) {
    e.preventDefault();
    self.emit("move", 0);
  });
  directionButtons[1].addEventListener("touchstart", function (e) {
    e.preventDefault();
    self.emit("move", 1);
  });
  directionButtons[2].addEventListener("touchstart", function (e) {
    e.preventDefault();
    self.emit("move", 2);
  });
  directionButtons[3].addEventListener("touchstart", function (e) {
    e.preventDefault();
    self.emit("move", 3);
  });*/

  /*if (window.DeviceOrientationEvent) {
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

    tilt.addEventListener('touchstart', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.gesture.preventDefault();
      e.gesture.stopPropagation();
      tilt.textContent = 'hold';
      neutralBeta = undefined;
      neutralGamma = undefined;
      window.addEventListener('deviceorientation', deviceorientation, true);
    });

    tilt.addEventListener('touchend', function (e) {
      e.preventDefault();
      tilt.textContent = 'release';
      window.removeEventListener('deviceorientation', deviceorientation, true);
    });


  }*/

};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};
