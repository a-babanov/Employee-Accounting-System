const { Model } = require("objection");
const Knex = require("knex");

const Holidays = require('../models/holidaysModel.js');

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

class KindOfHoliday extends Model {
  static get tableName() {
    return 'kindOfHoliday';
  };

  static get relationMappings() {
    return {
      kindOfHoliday: {
        relation: Model.HasManyRelation,
        modelClass: Holidays,
        join: {
          from: 'kindOfHoliday.id',
          to: 'holidays.kindOfHolidayId'
        }
      }
    }
  }
}

async function createSchema() {
  if (await knex.schema.hasTable('kindOfHoliday')) {
    console.log("kindOfHoliday is already exists in database!");
    return;
  }

  // Create database schema. You should use knex migration files
  // to do this. We create it here for simplicity.
  await knex.schema.createTable('kindOfHoliday', table => {
    table.increments('id').primary();
    table.string('nameOfHoliday', 50);
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

module.exports = KindOfHoliday;


