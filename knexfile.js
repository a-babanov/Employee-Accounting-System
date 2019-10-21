// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      host: "127.0.0.1",
      user: 'root',
      password: null,
      database: 'employeedb'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations',
      directory: './migrations'
    }
  },

  staging: {
    client: 'mysql2',
    connection: {
      host: "127.0.0.1",
      user: 'root',
      password: null,
      database: 'employeedb'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations',
      directory: './migrations'
    }
  },

  production: {
    client: 'mysql2',
    connection: {
      host: "127.0.0.1",
      user: 'root',
      password: null,
      database: 'employeedb'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations',
      directory: './migrations'
    }
  }

};
