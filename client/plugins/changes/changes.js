(function() {
  var constructor, listItemHtml, pageBundle;

  listItemHtml = function(slug, page) {
    return "<li><a class=\"internal\" href=\"#\" title=\"local\" data-page-name=\"" + slug + "\" data-site=\"local\">" + page.title + "</a> <button class=\"delete\">✕</button></li>";
  };

  pageBundle = function() {
    var bundle, i, length, slug, _i;
    bundle = {};
    length = localStorage.length;
    for (i = _i = 0; 0 <= length ? _i < length : _i > length; i = 0 <= length ? ++_i : --_i) {
      slug = localStorage.key(i);
      bundle[slug] = JSON.parse(localStorage.getItem(slug));
    }
    return bundle;
  };

  constructor = function($, dependencies) {
    var bind, emit, localStorage;
    if (dependencies == null) {
      dependencies = {};
    }
    localStorage = dependencies.localStorage || window.localStorage;
    emit = function($div, item) {
      var i, page, slug, ul, _i, _ref;
      if (localStorage.length === 0) {
        $div.append('<ul><p>empty</p></ul>');
        return;
      }
      $div.append(ul = $('<ul />'));
      for (i = _i = 0, _ref = localStorage.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        slug = localStorage.key(i);
        page = JSON.parse(localStorage.getItem(slug));
        ul.append(listItemHtml(slug, page));
      }
      if (item.submit != null) {
        return ul.append("<button class=\"submit\">Submit Changes</button>");
      }
    };
    bind = function($div, item) {
      $div.on('click', '.delete', function() {
        var slug;
        slug = $(this).siblings('a.internal').data('pageName');
        localStorage.removeItem(slug);
        return emit($div.empty(), item);
      });
      $div.on('click', '.submit', function() {
        return $.ajax({
          type: 'PUT',
          url: "/submit",
          data: {
            'bundle': JSON.stringify(pageBundle())
          },
          success: function(citation, textStatus, jqXHR) {
            var before, beforeElement, itemElement, pageElement;
            wiki.log("ajax submit success", citation, textStatus, jqXHR);
            if (!(citation.type && citation.site)) {
              throw new Exception("Incomplete Submission");
            }
            pageElement = $div.parents('.page:first');
            itemElement = $("<div />", {
              "class": "item " + citation.type
            }).data('item', citation).attr('data-id', citation.id);
            itemElement.data('pageElement', pageElement);
            pageElement.find(".story").append(itemElement);
            wiki.doPlugin(itemElement, citation);
            beforeElement = itemElement.prev('.item');
            before = wiki.getItem(beforeElement);
            return wiki.pageHandler.put(pageElement, {
              item: citation,
              id: citation.id,
              type: "add",
              after: before != null ? before.id : void 0
            });
          },
          error: function(xhr, type, msg) {
            return wiki.log("ajax error callback", type, msg);
          }
        });
      });
      return $div.dblclick(function() {
        var bundle, count;
        bundle = pageBundle();
        count = _.size(bundle);
        return wiki.dialog("JSON bundle for " + count + " pages", $('<pre/>').text(JSON.stringify(bundle, null, 2)));
      });
    };
    return {
      emit: emit,
      bind: bind
    };
  };

  wiki.registerPlugin('changes', constructor);

  if (typeof module !== "undefined" && module !== null) {
    module.exports = constructor;
  }

}).call(this);
