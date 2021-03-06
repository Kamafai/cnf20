'use strict';

var prettydate = require('./prettydate');
var cloudimage = require('./cloudimage');
var strftime = require('strftime');
var marked = require('marked');
var escape = function (html) {
  // Copied from EJS
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};

module.exports = function () {
  return {
    cloudimage : cloudimage,
    prettydate : prettydate,
    strftime : strftime,
    escape : escape,
    escapeJsData : function (data) {
      return String(data)
        .replace(/'/g, '\\' + 'u0027')
        .replace(/"/g, '\\' + 'u0022');
    },
    script : function (path, type) {
      return this.block('scripts', path ? '<script src="' + path + '"' + (type ? 'type="' + type + '"' : '') + '></script>' : undefined);
    },
    stylesheet : function (path, media) {
      return this.block('stylesheets', path ? '<link rel="stylesheet" href="' + path + '"' + (media ? 'media="' + media + '"' : '') + ' />' : undefined);
    },
    machineName : function (name) {
      return name.toLowerCase().replace(/[^\w]+/g, '-');
    },
    marked : function (src, opt, callback) {
      var renderer, noWrapping, headingRenderer;

      opt = opt || {};

      if (opt.noBlocks || opt.levelOffset) {
        renderer = new marked.Renderer();
        opt.renderer = renderer;

        if (opt.noBlocks) {
          noWrapping = function (text) {
            return text + '\n';
          };
          renderer.heading = noWrapping;
          renderer.paragraph = noWrapping;
        } else if (opt.levelOffset) {
          headingRenderer = renderer.heading;
          renderer.heading = function (text, level, raw) {
            // Push all headers down to avoid clashes with the layout headers
            level = Math.min(6, level + opt.levelOffset);
            return headingRenderer.call(this, text, level, raw);
          };
        }
      }

      return marked(src, opt, callback);
    },
    linebreakTheFront : function (text) {
      var lines = text.split(/\n/);
      var result = '';
      for (var i = 0, length = lines.length; i < length; i += 1) {
        if (i > 0) {
          result += '<br />';
        }
        result += escape(lines[i]);
      }
      return result;
    },
  };
};
