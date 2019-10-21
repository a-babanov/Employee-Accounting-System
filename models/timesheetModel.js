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

module.exports = TimeSheet;


