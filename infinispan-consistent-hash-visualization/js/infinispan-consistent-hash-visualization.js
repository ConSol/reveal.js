/*global document: true, $: true */
$(document).ready(function () {

    "use strict";

    var keys,
//        mode = 'repl_async',
        mode = 'dist_async',
        stats = {},
        node2color = {},
        colors = [];

    function highlight(key) {
        $('.' + key).addClass('highlight');
    }

    function stopHighlight(key) {
        $('.' + key).removeClass('highlight');
    }

    function updateStats(node) {
        var count = stats[node],
            div = $('#' + node).find('.node-summary'),
            total_primary = 0,
            total_backup = 0;
        $.each(stats, function (node, count) {
            total_primary = total_primary + count.primary;
            total_backup = total_backup + count.secondary;
        });
        $('#summary').html($('<span>keys: ' + keys.length + '</span><br/>' +
                             '<span>total: ' + (total_primary + total_backup) + '</span><br/>' +
                             '<span>primary: ' + total_primary + '</span><br/>' +
                             '<span>secondary: ' + total_backup + '</span>'));
        div.html($(
            '<span>total: ' + (count.primary + count.secondary) + '</span><br>' +
            '<span>primary: ' + count.primary + '</span><br/>' +
            '<span>secondary: ' + count.secondary + '</span>')
        );
    }

    function locate(url, key) {
        $.ajax({
            url: url + "/exec/org.infinispan:component=DistributionManager,manager=%22DefaultCacheManager%22,name=%22___defaultcache(" + mode + ")%22,type=Cache/locateKey/" + key,
            dataType: "json",
            success: function (data, textStatus, jqXHR) {
                $.each(data.value, function (i, node) {
                    var cssClass = i === 0 ? 'primary' : 'secondary',
                        keyDiv = $('<div class="key ' + key + ' ' + cssClass + '" style="background-color: ' + node2color[data.value[0]] + '">key ' + key + ' (' + cssClass + ')</div>');
                    if (!stats.hasOwnProperty(node)) {
                        stats[node] = { primary: 0, secondary: 0};
                    }
                    stats[node][cssClass] = stats[node][cssClass] + 1;
                    updateStats(node);
                    keyDiv.hover(function () { highlight(key); }, function () { stopHighlight(key); });
                    $('#' + node + ' > .node-content').append(keyDiv);
                });
            }
        });
    }

    function generateColors(n) {

        // Convert HSV color to RGB color.
        // h, s, v are all numbers with 0.0 <= number <= 1.0
        // http://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
        function convertHSVtoRGB(h, s, v) {
            var r, g, b, i, f, p, q, t;
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
            }
            return {
                r: Math.floor(r * 255),
                g: Math.floor(g * 255),
                b: Math.floor(b * 255)
            };
        }

        // Pastel colors are the family of colors which, when described in the HSV color space,
        // have high value and low to intermediate saturation.
        // http://en.wikipedia.org/wiki/Pastel_(color)
        var s = 0.5,
            v = 1.0,
            dh = 1.0 / n, // delta between two hue values.
            h,
            rgb,
            result = [];

        for (h = 0.0; h < 1.0; h += dh) {
            rgb = convertHSVtoRGB(h, s, v);
            result.push("rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");
        }
        return result;
    }

    function generate600Keys() {
        var keys = [],
            alphabet = "abcdefghijklmnopqrstuvwxyz",
            i = 0,
            j = 0;
        while (i < alphabet.length) {
            while (j < alphabet.length) {
                keys.push({key: alphabet[i] + alphabet[j]});
                j = j + 1;
                if (keys.length === 600) {
                    return keys;
                }
            }
            j = 0;
            i = i + 1;
        }
    }

    $('form').submit(function () {
        var url = $('input').val();
        stats = {};
        $.ajax({
            url: url + "/read/org.infinispan:component=CacheManager,name=%22DefaultCacheManager%22,type=CacheManager/clusterMembers",
            dataType: "json",
            success: function (data, textStatus, jqXHR) {
                $('#nodes').html('');
                var nodes = data.value.replace('[', '').replace(']', '').split(', '),
                    colors = generateColors(nodes.length),
                    template = $('#node-tile-template').html();
                $.each(nodes, function (i, node) {
                    node2color[node] = colors[i];
                    var data = {
                        'node-name': node,
                        'node-color': node2color[node],
                        'total': '0',
                        'primary': '0',
                        'secondary': '0'
                    };
                    $('#nodes').append($(Mustache.render(template, data)));
//                    $('#nodes').append($('<div id="' + node + '" class="node"><div class="node-name">' + node + ' <div style="background-color: ' + node2color[node] + '"><input type="checkbox"/></div></div><div class="node-summary"></div><div class="node-content"></div></div>'));
                });
                keys = generate600Keys();
                $.each(keys, function (i, key) {
                    locate(url, key.key);
                });
            }
        });
        return false;
    });
});
