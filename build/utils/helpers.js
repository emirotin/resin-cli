
/*
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

(function() {
  var Promise, _, capitano, chalk, os, president;

  Promise = require('bluebird');

  capitano = Promise.promisifyAll(require('capitano'));

  _ = require('lodash');

  _.str = require('underscore.string');

  president = Promise.promisifyAll(require('president'));

  os = require('os');

  chalk = require('chalk');

  exports.getGroupDefaults = function(group) {
    return _.chain(group).get('options').map(function(question) {
      return [question.name, question["default"]];
    }).object().value();
  };

  exports.stateToString = function(state) {
    var percentage, result;
    percentage = _.str.lpad(state.percentage, 3, '0') + '%';
    result = (chalk.blue(percentage)) + " " + (chalk.cyan(state.operation.command));
    switch (state.operation.command) {
      case 'copy':
        return result + " " + state.operation.from.path + " -> " + state.operation.to.path;
      case 'replace':
        return result + " " + state.operation.file.path + ", " + state.operation.copy + " -> " + state.operation.replace;
      case 'run-script':
        return result + " " + state.operation.script;
      default:
        throw new Error("Unsupported operation: " + state.operation.type);
    }
  };

  exports.sudo = function(command, message) {
    command = _.union(_.take(process.argv, 2), command);
    console.log(message);
    if (os.platform() !== 'win32') {
      console.log('Type your computer password to continue');
    }
    return president.executeAsync(command);
  };

}).call(this);
