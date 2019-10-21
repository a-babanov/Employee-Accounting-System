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