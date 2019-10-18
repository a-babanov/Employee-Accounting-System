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

async function createSchema() {
  if (await knex.schema.hasTable('holidays')) {
    console.log("holidays is already exists in database!");
    return;
  }

  // Create database schema. You should use knex migration files
  // to do this. We create it here for simplicity.
  await knex.schema.createTable('holidays', table => {
    table.increments('id').primary();
    table.datetime('date_from');
    table.datetime('date_to');
    table.text('causeText');
    table.integer('kindOfHolidayId');
    table.integer('employeeId');
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

module.exports = Holidays;


