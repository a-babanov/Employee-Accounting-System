exports.up = async function(knex) {
  return knex.schema
    .createTableIfNotExists('users_login', table => {
      table.increments('id').primary();
      table.string('login');
      table.string('password');
      table.boolean('role');
    })
    .createTableIfNotExists('kindOfHoliday', table => {
      table.increments('id').primary();
      table.string('nameOfHoliday', 50);
    })
    .createTableIfNotExists('employees', table => {
      table.increments('id').primary();
      table.string('employee', 50);
      table.date('birthDay');
      table.date('appointmentDay');
      table.date('terminationDay');
    })
    .createTableIfNotExists('holidays', table => {
      table.increments('id').primary();
      table.datetime('date_from');
      table.datetime('date_to');
      table.text('causeText');
      table
        .integer('kindOfHolidayId')
        .unsigned()
        .references('id')
        .inTable('kindOfHoliday')
        .onDelete('CASCADE')
        .index();
      table
        .integer('employeeId')
        .unsigned()
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
        .index();
    })
    .createTableIfNotExists('timeSheet', table => {
      table.increments('id').primary();
      table.date('currentDay');
      table.time('timeOfArrival ');
      table.time('numberOfHours ');
      table
        .integer('employeeId')
        .unsigned()
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
        .index();
      table.boolean('isExcused');
      table.text('comment');
    })
    .createTableIfNotExists('meeting', table => {
      table.increments('id').primary();
      table.date('currentDay');
      table.time('timeFrom');
      table.time('timeTo');
      table.text('causeText');
      table
        .integer('timesheetId')
        .unsigned()
        .references('id')
        .inTable('timeSheet')
        .onDelete('CASCADE')
        .index();
    });
};

exports.down = knex => {
  return knex.schema
    .dropTableIfExists('users_login')
    .dropTableIfExists('meeting')
    .dropTableIfExists('timeSheet')
    .dropTableIfExists('holidays')
    .dropTableIfExists('employees')
    .dropTableIfExists('kindOfHoliday')
};