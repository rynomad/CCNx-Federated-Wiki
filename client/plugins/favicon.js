(function() {
  var hsltorgb;

  hsltorgb = function(h, s, l) {
    var hue, m1, m2;
    h = (h % 360) / 360;
    m2 = l * (s + 1);
    m1 = (l * 2) - m2;
    hue = function(num) {
      if (num < 0) {
        num += 1;
      } else if (num > 1) {
        num -= 1;
      }
      if ((num * 6) < 1) {
        return m1 + (m2 - m1) * num * 6;
      } else if ((num * 2) < 1) {
        return m2;
      } else if ((num * 3) < 2) {
        return m1 + (m2 - m1) * (2 / 3 - num) * 6;
      } else {
        return m1;
      }
    };
    return [hue(h + 1 / 3) * 255, hue(h) * 255, hue(h - 1 / 3) * 255];
  };

  window.plugins.favicon = {
    create: function(db, repo) {
      var angle, canvas, colprep, cos, ctx, dark, fav, light, p, scale, sin, x, y, _i, _j;
      $('body').append($('<canvas />').attr('width', 32).attr('height', 32).attr('id', 'favmaker').attr('display', 'none').hide());
      canvas = document.getElementById('favmaker');
      ctx = canvas.getContext('2d');
      light = hsltorgb(Math.random() * 360, .78, .50);
      dark = hsltorgb(Math.random() * 360, .78, .25);
      angle = 2 * (Math.random() - 0.5);
      sin = Math.sin(angle);
      cos = Math.cos(angle);
      scale = Math.abs(sin) + Math.abs(cos);
      colprep = function(col, p) {
        return Math.floor(light[col] * p + dark[col] * (1 - p)) % 255;
      };
      for (x = _i = 0; _i <= 31; x = ++_i) {
        for (y = _j = 0; _j <= 31; y = ++_j) {
          p = sin >= 0 ? sin * x + cos * y : -sin * (31 - x) + cos * y;
          p = p / 31 / scale;
          ctx.fillStyle = "rgba(" + (colprep(0, p)) + ", " + (colprep(1, p)) + ", " + (colprep(2, p)) + ", 1)";
          ctx.fillRect(x, y, 1, 1);
        }
      }
      fav = {};
      fav.dataUrl = canvas.toDataURL();
      fav.type = 'favicon';
      $('#favicon').attr('href', fav);
      $('.favicon').attr('src', fav);
      db.put(fav);
      return repo.favicon = fav.dataUrl;
    }
  };

}).call(this);
