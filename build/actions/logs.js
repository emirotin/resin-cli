
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
  module.exports = {
    signature: 'logs <uuid>',
    description: 'show device logs',
    help: 'Use this command to show logs for a specific device.\n\nBy default, the command prints all log messages and exit.\n\nTo continuously stream output, and see new logs in real time, use the `--tail` option.\n\nNote that for now you need to provide the whole UUID for this command to work correctly.\n\nThis is due to some technical limitations that we plan to address soon.\n\nExamples:\n\n	$ resin logs 23c73a1\n	$ resin logs 23c73a1',
    options: [
      {
        signature: 'tail',
        description: 'continuously stream output',
        boolean: true,
        alias: 't'
      }
    ],
    permission: 'user',
    primary: true,
    action: function(params, options, done) {
      var _, moment, printLine, promise, resin;
      _ = require('lodash');
      resin = require('resin-sdk');
      moment = require('moment');
      printLine = function(line) {
        var timestamp;
        timestamp = moment(line.timestamp).format('DD.MM.YY HH:mm:ss (ZZ)');
        return console.log(timestamp + " " + line.message);
      };
      promise = resin.logs.history(params.uuid).each(printLine);
      if (!options.tail) {
        return promise["catch"](done)["finally"](function() {
          return process.exit(0);
        });
      }
      return promise.then(function() {
        return resin.logs.subscribe(params.uuid).then(function(logs) {
          logs.on('line', printLine);
          return logs.on('error', done);
        });
      })["catch"](done);
    }
  };

}).call(this);
