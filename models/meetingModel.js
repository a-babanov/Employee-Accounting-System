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

class Meeting extends Model {
  static get tableName() {
    return 'meeting';
  };
}

async function createSchema() {
  if (await knex.schema.hasTable('meeting')) {
    console.log("meeting is already exists in database!");
    return;
  }

  // Create database schema. You should use knex migration files
  // to do this. We create it here for simplicity.
  await knex.schema.createTable('meeting', table => {
    table.increments('id').primary();
    table.date('currentDay');
    table.time('timeFrom');
    table.time('timeTo');
    table.text('causeText');
    table.integer('timesheetId');
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

module.exports = Meeting;


