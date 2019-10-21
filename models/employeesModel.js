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

module.exports = Employee;


