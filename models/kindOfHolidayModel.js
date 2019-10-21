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

module.exports = KindOfHoliday;


