###
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
###

module.exports =
	signature: 'sync [uuid]'
	description: '(beta) sync your changes with a device'
	help: '''
		WARNING: If you're running Windows, this command only supports `cmd.exe`.

		Use this command to sync your local changes to a certain device on the fly.

		You can save all the options mentioned below in a `resin-sync.yml` file,
		by using the same option names as keys. For example:

			$ cat $PWD/resin-sync.yml
			source: src/
			before: 'echo Hello'
			ignore:
				- .git
				- node_modules/
			progress: true
			verbose: false

		Notice that explicitly passed command options override the ones set in the configuration file.

		Examples:

			$ resin sync MyApp
			$ resin sync 7cf02a6
			$ resin sync 7cf02a6 --port 8080
			$ resin sync 7cf02a6 --ignore foo,bar
			$ resin sync 7cf02a6 -v
	'''
	permission: 'user'
	primary: true
	options: [
			signature: 'source'
			parameter: 'path'
			description: 'custom source path'
			alias: 's'
		,
			signature: 'ignore'
			parameter: 'paths'
			description: 'comma delimited paths to ignore when syncing'
			alias: 'i'
		,
			signature: 'before'
			parameter: 'command'
			description: 'execute a command before syncing'
			alias: 'b'
		,
			signature: 'progress'
			boolean: true
			description: 'show progress'
			alias: 'p'
		,
			signature: 'port'
			parameter: 'port'
			description: 'ssh port'
			alias: 't'
		,
			signature: 'verbose'
			boolean: true
			description: 'increase verbosity'
			alias: 'v'
		,
	]
	action: (params, options, done) ->
		resin = require('resin-sdk')
		Promise = require('bluebird')
		resinSync = require('resin-sync')
		patterns = require('../utils/patterns')
		{ loadConfig } = require('../utils/helpers')

		Promise.try ->
			try
				fs.accessSync(path.join(process.cwd(), '.resin-sync.yml'))
			catch
				if not options.source?
					throw new Error('No --source option passed and no \'.resin-sync.yml\' file found in current directory.')

			options.source ?= process.cwd()

			# TODO: Add comma separated options to Capitano
			if options.ignore?
				options.ignore = options.ignore.split(',')

			Promise.resolve(params.uuid ? loadConfig(options.source).uuid)
			.then (uuid) ->
				if not uuid?
					return patterns.inferOrSelectDevice()

				resin.models.device.has(uuid)
				.then (hasDevice) ->
					if not hasDevice
						throw new Error("Device not found: #{uuid}")
					return uuid
			.then (uuid) ->
				resinSync.sync(uuid, options)
		.nodeify(done)
