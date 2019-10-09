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

module.exports = User;