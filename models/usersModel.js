const { Model } = require("objection");
const Knex = require("knex");

const knex = Knex({
	client: 'mysql2',
	connection: {
		host: "127.0.0.1",
		user: 'root',
		password: null,
		database: 'employeedb'
	}
});

Model.knex(knex);

class User extends Model {
  static tableName() {
    return 'users_login';
  };
}

async function createSchema() {
  if (await knex.schema.hasTable('users_login')) {
    console.log("users_login is already exists in database!");
    return;
  }

  // Create database schema. You should use knex migration files
  // to do this. We create it here for simplicity.
  await knex.schema.createTable('users_login', table => {
    table.increments('id').primary();
    table.string('login');
    table.string('password');
    table.boolean('role');
  });
}

createSchema()
  	.then(() => {
  		console.log("Соединение установлено!");
  	})
  	.catch(err => {
  		console.log("Произошла ошибка при установке соединения!");
    	console.error(err);
    	return knex.destroy();
  	});

module.exports = User;


/*
const Sequelize = require("sequelize");
const sequelize = new Sequelize("employeedb", "root", null, {
	dialect: "mysql",
	host: "127.0.0.1",
	define: {
		timestamps: false
	}
});

const User = sequelize.define("users_login", {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false
	},
	login: {
		type: Sequelize.STRING,
		allowNull: false
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false
	},
	role: {
		type: Sequelize.BOOLEAN,
		allowNull: false
	}
});

sequelize.sync()
	.then()
	.catch(err => console.log(err));
*/