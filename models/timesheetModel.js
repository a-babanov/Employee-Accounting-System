const { Model } = require("objection");
const Knex = require("knex");

const Meeting = require('../models/meetingModel.js');

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

class TimeSheet extends Model {
  static get tableName() {
    return 'timeSheet';
  };

  static get relationMappings() {
    return {
      meeting: {
        relation: Model.HasManyRelation,
        modelClass: Meeting,
        join: {
          from: 'timeSheet.id',
          to: 'meeting.timesheetId'
        }
      }
    }
  }
}

async function createSchema() {
  if (await knex.schema.hasTable('timeSheet')) {
    console.log("timeSheet is already exists in database!");
    return;
  }

  // Create database schema. You should use knex migration files
  // to do this. We create it here for simplicity.
  await knex.schema.createTable('timeSheet', table => {
    table.increments('id').primary();
    table.date('currentDay');
    table.time('timeOfArrival ');
    table.time('numberOfHours ');
    table.integer('employeeId');
    table.boolean('isExcused');
    table.text('comment');
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

module.exports = TimeSheet;


