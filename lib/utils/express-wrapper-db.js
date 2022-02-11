'use strict';

module.exports = function (ExpressWrapper, ExpressConfig) {
  ExpressConfig = ExpressConfig || ExpressWrapper.ExpressConfig;

  const protoProps = {};

  protoProps.constructor = function () {
    ExpressWrapper.apply(this, arguments);

    let configHelper = this.config.db.replace('postgres://', '');

    const connection = {
      host: configHelper.split('@')[1].split(':')[0],
      post: configHelper.split('@')[1].split(':')[1].split('/')[0],
      user: configHelper.split('@')[0].split(':')[0],
      password: configHelper.split('@')[0].split(':')[1],
      database: configHelper.split('@')[1].split('/')[1]
    }

    this.knex = require('knex')({
      client : 'pg',
      connection,
      pool : {
        min: 0,
      },
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    });
    this.on('closed', () => this.knex.destroy());
  };

  const staticProps = {};

  staticProps.dbDependencies = {
    // 'prefix-of-child': 'foo',
  };

  staticProps.knexConfig = function (env) {
    var config = this.ExpressConfig.getConfig(undefined, this.envConfigPrefix);

    let configHelper = config.db.replace('postgres://', '');

    const connection = {
      host: configHelper.split('@')[1].split(':')[0],
      post: configHelper.split('@')[1].split(':')[1].split('/')[0],
      user: configHelper.split('@')[0].split(':')[0],
      password: configHelper.split('@')[0].split(':')[1],
      database: configHelper.split('@')[1].split('/')[1]
    }

    var db = {
      client: 'pg',
      connection,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      /*
      migrations: {
        dependencies: this.dbDependencies,
        install: __dirname + '/../install-schema',
        directory: __dirname + '/../../migrations',
      },
      */
    };

    return env ? db : {
      development: db,
      staging: db,
      production: db,
    };
  };

  staticProps.runMigrationTask = async function (command, returnPromise) {
    command = command || process.argv[1];

    var commands = {
      install: 'install',
      migrate: 'latest',
      rollback: 'rollback',
    };

    if (!command || !commands[command]) {
      process.exit(1);
    }

    command = commands[command];

    var env = this.ExpressConfig.getConfig(undefined, this.envConfigPrefix).env;
    var knexConfig = this.knexConfig(env);
    const knex = require('knex')(knexConfig);
    const installSchema = require('../install-schema');
    /*
    var knex = require('knex')(knexConfig);
    var migrator = require('knex-migrator-extension')(knex);

    var result = migrator[command]();
    */

    console.log('###', knexConfig);
    try {
      // Create a table
      await installSchema(knex)
      console.log('Success!');
      process.exit(0);

    } catch(e) {
      console.error('Migration failed:', e);
      process.exit(1);
    };

    /*
    if (returnPromise) {
      return result;
    }


    result
      .then(function () {
        console.log('Success!');
        process.exit(0);
      })
      .catch(function (err) {
        console.error('Migration failed:', err.message, err.stack);
        process.exit(1);
      });
      */
  };

  staticProps.ExpressConfig = ExpressConfig.staticExtend({
    testDatabase: 'postgres://postgres@localhost/vp_express_wrapper_test',
    _mapEnvToConfig: function (env, prefix) {
      let config = ExpressConfig._mapEnvToConfig.call(this, env, prefix);

      return Object.assign(config, {
        db: (
          env.NODE_ENV === 'test'
          ? env.DATABASE_TEST_URL || this.testDatabase
          : env.DATABASE_URL
          ) + (env[prefix + 'DATABASE_SSL'] ? '?ssl=true' : ''),
      });
      // return Object.assign(config, {
      //   db: (
      //     env.NODE_ENV === 'test'
      //     ? env.DATABASE_TEST_URL || this.testDatabase
      //     : env.DATABASE_URL
      //   ) + (env[prefix + 'DATABASE_SSL'] ? '?ssl=true' : ''),
      // });
    },
  });

  return ExpressWrapper.extend(protoProps, staticProps);
};
