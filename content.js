(function() {
    panelData = {
        panels: [],
        panelsByName: {},

        update: function(debugData) {
            debugData.panels.forEach(function(reqPanel) {
                var reqData = {
                    url: debugData.reqUrl,
                    kpi1: reqPanel.kpi1,
                    kpi2: reqPanel.kpi2,
                    detailsUrl: reqPanel.detailsUrl
                };

                var existing = panelData.panelsByName[reqPanel.name];
                if (existing) {
                    // TODO verify that units line up
                    existing.kpi1.val += reqPanel.kpi1.val;
                    existing.kpi2.val += reqPanel.kpi2.val;
                    existing.reqs.push(reqData);
                } else {
                    var panel = {
                        name: reqPanel.name,
                        kpi1: jQuery.extend(true, {}, reqPanel.kpi1),
                        kpi2: jQuery.extend(true, {}, reqPanel.kpi2),
                        reqs: [reqData]
                    };
                    panelData.panels.push(panel);
                    panelData.panelsByName[reqPanel.name] = panel;
                }
            });
        }
    }

    function rebuildHtmls() {
        var htmls = {
            panelList: '',
            panelContainer: ''
        };

        panelData.panels.forEach(function(panel) {
            htmls.panelList += (
                '<li id="id-' + panel.name + '">' +
                '  <a href="#" title="' + panel.name + '" class="' + panel.name + '">' +
                '    ' + panel.name +
                '    <br />' +
                '    <small>' +
                '      ' + panel.kpi1.val + ' ' + panel.kpi1.unit +
                '      (' + panel.kpi2.val + ' ' + panel.kpi2.unit + ')' +
                '    </small>' +
                '  </a>' +
                '</li>'
            );
        });

        panelData.panels.forEach(function(panel) {
            htmls.panelContainer += (
                '<div id="' + panel.name + '-content" class="panelContent">' +
                '  <div class="pDebugPanelTitle">' +
                '    <a href="" class="pDebugClose">Close</a>' +
                '    <h3>' + panel.name + '</h3>' +
                '  </div>' +
                '  <div class="pDebugPanelContent">' +
                '    <div class="scroll">'
            )
            panel.reqs.forEach(function(req) {
                htmls.panelContainer += (
                    '<p>' +
                        '<a href="#" class="details" data-href="' + req.detailsUrl + '">' +
                            req.url + ': ' +
                            req.kpi1.val + ' ' + req.kpi1.unit +
                            ' (' + req.kpi2.val + ' ' + req.kpi2.unit + ')' +
                        '</a>' +
                    '</p>'
                )
            });
            htmls.panelContainer += (
                '      <iframe class="' + panel.name + '" height="500px" width="100%"></iframe>' +
                '    </div>' +
                '  </div>' +
                '</div>'
            );
        });

        return htmls;
    }

    cookie = function(name, value, options) { if (typeof value != 'undefined') { options = options || {}; if (value === null) { value = ''; options.expires = -1; } var expires = ''; if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) { var date; if (typeof options.expires == 'number') { date = new Date(); date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000)); } else { date = options.expires; } expires = '; expires=' + date.toUTCString(); } var path = options.path ? '; path=' + (options.path) : ''; var domain = options.domain ? '; domain=' + (options.domain) : ''; var secure = options.secure ? '; secure' : ''; document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join(''); } else { var cookieValue = null; if (document.cookie && document.cookie != '') { var cookies = document.cookie.split(';'); for (var i = 0; i < cookies.length; i++) { var cookie = $.trim(cookies[i]); if (cookie.substring(0, name.length + 1) == (name + '=')) { cookieValue = decodeURIComponent(cookie.substring(name.length + 1)); break; } } } return cookieValue; } };
    var COOKIE_NAME = 'pdtb';
    var COOKIE_NAME_ACTIVE = COOKIE_NAME +'_active';
    var pdtb = {
      events: {
        ready: []
      },
      isReady: false,
      init: function() {
        $('#pDebug').show();
        var current = null;
        $('body').on('click', '#pDebugPanelList li a', function() {
          if (!this.className) {
            return false;
          }
          current = $('#pDebug #' + this.className + '-content');
          if (current.is(':visible')) {
            $(document).trigger('close.pDebug');
            $(this).parent().removeClass('active');
          } else {
            $('.panelContent').hide(); // Hide any that are already open
            current.show();
            $('#pDebugToolbar li').removeClass('active');
            $(this).parent().addClass('active');
          }
          return false;
        });
        $('body').on('click', '#pDebugPanelList li .switch', function() {
          var $panel = $(this).parent();
          var $this = $(this);
          var dom_id = $panel.attr('id');
          // Turn cookie content into an array of active panels
          var active_str = $.cookie(COOKIE_NAME_ACTIVE);
          var active = (active_str) ? active_str.split(';') : [];
          active = $.grep(active, function(n,i) { return n != dom_id; });
          if ($this.hasClass('active')) {
            $this.removeClass('active');
            $this.addClass('inactive');
          }
          else {
            active.push(dom_id);
            $this.removeClass('inactive');
            $this.addClass('active');
          }
          if (active.length > 0) {
            cookie(COOKIE_NAME_ACTIVE, active.join(';'), {
                path: '/', expires: 10
            });
          }
          else {
            cookie(COOKIE_NAME_ACTIVE, null, {
              path: '/', expires: -1
            });
          }
        });
        $('body').on('click', '.panelContent a.details', function(event) {
            var detailsUrl = $(this).data('href');
            var content = $(this).closest('.panelContent');
            var iframe = $('iframe', content);
            iframe.attr('src', detailsUrl);
            return false;
        });
        $('body').on('click', '#pDebug a.pDebugClose', function() {
          $(document).trigger('close.pDebug');
          $('#pDebugToolbar li').removeClass('active');
          return false;
        });
        $('body').on('click', '#pDebug a.remoteCall', function() {
          $('#pDebugWindow').load(this.href, {}, function() {
            $('body').on('click', '#pDebugWindow a.pDebugBack', function() {
              $(this).parent().parent().hide();
                return false;
            });
          });
          $('#pDebugWindow').show();
          return false;
        });
        $('body').on('click', '#pDebugTemplatePanel a.pTemplateShowContext', function() {
          pdtb.toggle_arrow($(this).children('.toggleArrow'))
          pdtb.toggle_content($(this).parent().next());
          return false;
        });
        $('body').on('click', '#pDebugSQLPanel a.pSQLShowStacktrace', function() {
          pdtb.toggle_content($('.pSQLHideStacktraceDiv', $(this).parents('tr')));
          return false;
        });
        $('#pHideToolBarButton').on('click', function() {
          pdtb.hide_toolbar(true);
          return false;
        });
        $('#pShowToolBarButton').on('click', function() {
          pdtb.show_toolbar();
          return false;
        });
        $("#pShowToolBarButton").on("mouseenter mouseleave", function() {
          $(this).data('pTimeout', setTimeout(function() {
            pdtb.show_toolbar(false, true);
            return false;
          }, 1000));
        }, function () {
          clearTimeout($(this).data('pTimeout'));
        });
        $(document).bind('close.pDebug', function() {
          // If a sub-panel is open, close that
          if ($('#pDebugWindow').is(':visible')) {
            $('#pDebugWindow').hide();
            return;
          }
          // If a panel is open, close that
          if ($('.panelContent').is(':visible')) {
            $('.panelContent').hide();
            return;
          }
          // Otherwise, just minimize the toolbar
          if ($('#pDebugToolbar').is(':visible')) {
            pdtb.hide_toolbar(true);
            return;
          }
        });
        if (cookie(COOKIE_NAME)) {
          pdtb.hide_toolbar(false);
        } else {
          pdtb.show_toolbar(false);
        }
        $('#pDebug .pDebugHoverable').on("mouseenter mouseleave", function() {
          $(this).addClass('pDebugHover');
        }, function(){
          $(this).removeClass('pDebugHover');
        });
        pdtb.isReady = true;
        $.each(pdtb.events.ready, function(_, callback){
          callback(pdtb);
        });
      },
      toggle_content: function(elem) {
        if (elem.is(':visible')) {
          elem.hide();
        } else {
          elem.show();
        }
      },
      close: function() {
        $(document).trigger('close.pDebug');
        return false;
      },
      hide_toolbar: function(setCookie) {
        // close any sub panels
        $('#pDebugWindow').hide();
        // close all panels
        $('.panelContent').hide();
        $('#pDebugToolbar li').removeClass('active');
        // finally close toolbar
        $('#pDebugToolbar').hide('fast');
        $('#pDebugToolbarHandle').show();
        // Unbind keydown
        $(document).unbind('keydown.pDebug');
        if (setCookie) {
          cookie(COOKIE_NAME, 'hide', {
            path: '/',
            expires: 10
          });
        }
      },
      show_toolbar: function(animate, auto_hide) {
        auto_hide = auto_hide || false
        // Set up keybindings
        $(document).bind('keydown.pDebug', function(e) {
          if (e.keyCode == 27) {
            pdtb.close();
          }
        });
        $('#pDebugToolbarHandle').hide();
        if (animate) {
          $('#pDebugToolbar').show('fast');
        } else {
          $('#pDebugToolbar').show();
        }
        if (auto_hide == false) {
          cookie(COOKIE_NAME, null, {
            path: '/',
            expires: -1
          });
        }
      },
      toggle_arrow: function(elem) {
          var uarr = String.fromCharCode(0x25b6);
          var darr = String.fromCharCode(0x25bc);
          elem.html(elem.html() == uarr ? darr : uarr);
      },
      // ready: function(callback){
      //   if (pdtb.isReady) {
      //     callback(pdtb);
      //   } else {
      //     pdtb.events.ready.push(callback);
      //   }
      // }
    };

    function updatePanel(debugData) {
        console.log("Got debug data for a request.");
        panelData.update(debugData);

        if ($('.panelContent').is(':visible')) {
            // TODO queue up rebuild for when it's closed; a rebuild would lose all
            // user state (and close the content panel).
        } else {
            var htmls = rebuildHtmls();
            var listEl = document.getElementById('pDebugPanelList');
            if (listEl) {
                listEl.innerHTML = htmls.panelList;
            }
            var contEl = document.getElementById('panelContainer');
            if (contEl) {
                contEl.innerHTML = htmls.panelContainer;
            }
        }
    }

    function setupUpdateHandler() {
        chrome.runtime.onMessage.addListener(function(debugData, sender, sendResponse) {
            sendResponse({status: 'ok'});
            updatePanel(debugData);
        });
    }

    function injectToolbar() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", chrome.extension.getURL("toolbar.html"), true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                $('body').append(xhr.responseText);
                pdtb.init();
                // $(".pDebugSortable").tablesorter();
                setupUpdateHandler();
            }
        }
        xhr.send();
    }

    injectToolbar();
}());
