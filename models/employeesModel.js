const { Model } = require("objection");
const Knex = require("knex");

const Holidays = require('../models/holidaysModel.js');
const TimeSheet = require('../models/timesheetModel.js');

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

class Employee extends Model {
  static get tableName() {
    return 'employees';
  };

  static get relationMappings() {
    return {
      holidays: {
        relation: Model.HasManyRelation,
        modelClass: Holidays,
        join: {
          from: 'employees.id',
          to: 'holidays.employeeId'
        }
      },

      timesheet: {
        relation: Model.HasManyRelation,
        modelClass: TimeSheet,
        join: {
          from: 'employees.id',
          to: 'timesheet.employeeId'
        }
      } 
    }
  }
}

async function createSchema() {
  if (await knex.schema.hasTable('employees')) {
    console.log("employees is already exists in database!");
    return;
  }

  // Create database schema. You should use knex migration files
  // to do this. We create it here for simplicity.
  await knex.schema.createTable('employees', table => {
    table.increments('id').primary();
    table.string('employee', 50);
    table.date('birthDay');
    table.date('appointmentDay');
    table.date('terminationDay');
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

module.exports = Employee;


