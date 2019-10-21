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

class Holidays extends Model {
  static tableName() {
    return 'holidays';
  };
}

module.exports = Holidays;


