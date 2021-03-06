(function() {
  var brand, bu, display, fy, h, region, w;

  w = 426;

  h = 300;

  fy = "FY09";

  region = "N ASIA";

  brand = "NIKE";

  bu = "APRL";

  display = function(div, item, vis, collection, locations, factories) {
    var countries, fill, force, node, path, states, xy;
    xy = d3.geo.mercator().scale(2500).translate([-600, 350]);
    path = d3.geo.path().projection(xy);
    fill = d3.scale.category20();
    countries = {};
    factories = factories.filter(function(o) {
      return o.fy === fy && o.region === region && o.brand === brand && o.bu === bu;
    });
    factories = factories.map(function(f) {
      f.coordinates = [];
      f.coordinates[0] = locations[f.country].location.lng;
      f.coordinates[1] = locations[f.country].location.lat;
      f.x = 0;
      f.y = 0;
      f.fx = xy(f.coordinates)[0];
      f.fy = xy(f.coordinates)[1];
      countries[f.country] = xy(f.coordinates);
      return f;
    });
    force = d3.layout.force().nodes(factories).links([]).size([w, h]).friction(.75).charge(-4).start();
    states = vis.append("svg:g").attr("id", "states");
    states.selectAll("path").data(collection.features).enter().append("svg:path").attr("d", path).append("title").text(function(d) {
      return d.properties.name;
    });
    node = vis.selectAll("circle.node").data(factories).enter().append("svg:circle").attr("opacity", 0).attr("class", "node").attr("cx", function(d) {
      return d.x;
    }).attr("cy", function(d) {
      return d.y;
    }).attr("r", 3).attr("title", function(d) {
      return d.crcode;
    }).style("fill", function(d, i) {
      return d3.rgb(fill(d.country)).darker(Math.random());
    }).call(force.drag).transition().duration(900).attr("opacity", 1);
    return force.on("tick", function(e) {
      var k;
      k = .3 * e.alpha;
      factories.forEach(function(o, i) {
        o.y += (o.fy - o.y) * k;
        return o.x += (o.fx - o.x) * k;
      });
      return vis.selectAll("circle.node").attr("cx", function(d) {
        return d.x;
      }).attr("cy", function(d) {
        return d.y;
      });
    });
  };

  window.plugins.pushpin = {
    emit: function(div, item) {
      return div.append("<style type=\"text/css\">\n  .pushpin path { fill: #ccc; stroke: #fff; }\n  .pushpin svg { border: solid 1px #ccc; background: #eee; }\n</style>");
    },
    bind: function(div, item) {
      return wiki.getScript('/js/d3/d3.js', function() {
        var vis;
        vis = d3.select(div.get(0)).append("svg:svg").attr("width", w).attr("height", h);
        return wiki.getScript('/js/d3/d3.geo.js', function() {
          return wiki.getScript('/js/d3/d3.geom.js', function() {
            return wiki.getScript('/js/d3/d3.layout.js', function() {
              return d3.json("/plugins/pushpin/world-countries.json", function(collection) {
                return d3.json("/plugins/pushpin/factories-locations.json", function(locations) {
                  return d3.json("/plugins/pushpin/factories.json", function(factories) {
                    return display(div, item, vis, collection, locations, factories);
                  });
                });
              });
            });
          });
        });
      });
    }
  };

}).call(this);
