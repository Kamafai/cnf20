'use strict';

var VarsType = require('../../').VarsType;
var _ = require('lodash');
var forms = require('forms');
var fields = forms.fields;

module.exports = VarsType.extend({
  constructor : function (options) {
    VarsType.call(this, options);

    this.permission = 'administer site';
  },
  isDefaultTemplateData : function () {
    return true;
  },
  getFormSettings : function () {
    var formSettings = VarsType.prototype.getFormSettings.call(this);

    _.extend(formSettings, {
      body: fields.string({
        label: 'Kod',
        widget: forms.widgets.textarea({
          classes : ['syntax-highlight', 'syntax-highlight-css'],
        }),
      }),
    });

    return formSettings;
  },
});
