'use strict';

module.exports = async function (knex) {
  return await knex.schema.createTable('accounts', table => {
      table.increments('id').notNullable().primary();
      table.string('service').notNullable();
      table.string('identifier').notNullable();
      table.string('external_id');
      table.string('role', true).notNullable().defaultTo('admin');
      table.timestamp('lastlogin', true);

      table.unique(['service', 'identifier']);
      table.unique(['service', 'external_id']);
    }).createTable('session', table => {
      table.string('sid').primary();
      table.json('sess').notNullable();
      table.timestamp('expire', true).notNullable();
    })
    .createTable('agenda', table => {
      table.increments('id').primary();
      table.boolean('published').notNullable().defaultTo(true).index();
      table.string('title').notNullable();
      table.time('start');
      table.time('stop');
      table.string('speaker');
      table.text('description');
      table.integer('category').notNullable().defaultTo(0);
      table.json('data', true);
      table.timestamp('created', true).notNullable().defaultTo(knex.raw('NOW()'));
      table.timestamp('modified', true).notNullable().defaultTo(knex.raw('NOW()'));
    })
    .createTable('speakers', table => {
      table.increments('id').primary();
      table.integer('page').notNullable().defaultTo(0);
      table.boolean('published').notNullable().defaultTo(true).index();
      table.string('name').notNullable();
      table.text('description');
      table.json('links');
      table.string('image');
      table.json('data', true);
      table.timestamp('created', true).notNullable().defaultTo(knex.raw('NOW()'));
      table.timestamp('modified', true).notNullable().defaultTo(knex.raw('NOW()'));
    })
    .createTable('vars', table => {
      table.string('key').notNullable();
      table.integer('page').notNullable().defaultTo(0);
      table.json('value').notNullable();
      table.timestamp('modified', true).notNullable().defaultTo(knex.raw('NOW()'));
      table.primary(['key', 'page']);
    })
    .createTable('speaker_agendas', table => {
      table.increments('id').notNullable().primary();
      table.integer('speaker').notNullable().index();
      table.integer('agenda').notNullable().index();

      table.unique(['speaker', 'agenda']);
    })
    .createTable('agenda_agendas', table => {
      table.increments('id').notNullable().primary();
      table.integer('agenda_from').notNullable().index();
      table.integer('agenda_to').notNullable().index();

      table.unique(['agenda_from', 'agenda_to']);
    })
    .createTable('ticket_order', table => {
      table.string('id', 10).primary();
      table.string('ticket_type', 40).notNullable();
      table.string('product_type', 40).notNullable();
      table.string('payment_type', 40).notNullable();
      table.string('email').notNullable();
      table.string('stripe_token');
      table.integer('ticket_price').notNullable();
      table.timestamp('removed_at', true);
      table.timestamp('sent_at', true);
      table.timestamp('paid_at', true);
      table.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
    })
    .createTable('ticket_items', table => {
      table.string('tid').notNullable().references('ticket_order.id');
      table.increments('item_id').notNullable();
      table.json('ticket', true).notNullable();
      table.string('stripe_refund');
      table.bool('deleted').defaultTo(false);
    })
    .createTable('ticket_invoice', table => {
      table.increments('invoice_number').primary();
      table.string('tid').unique().notNullable().references('ticket_order.id');
      table.string('fortnox_id').unique();
      table.json('invoice', true).notNullable();
    })
    .createTable('ticket_audit_log', table => {
      table.increments('audit_id').primary();
      table.string('tid').references('ticket_order.id');
      table.integer('item_id').references('ticket_items.item_id');
      table.string('made_by').notNullable();
      table.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
      table.json('old_values', true).notNullable();
      table.json('new_values', true).notNullable();
    })
};
