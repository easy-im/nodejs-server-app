import dayjs from 'dayjs';
import knex, { Knex } from 'knex';
import config from '../config';

export default class BasicModel<T> {
  private builder: Knex.QueryBuilder;

  protected knex = knex({
    client: 'mysql',
    connection: config.mysql,
    pool: { min: 0, max: 7 },
  });

  constructor(table: string) {
    this.builder = this.knex<T>(table);
  }

  get queryBuilder() {
    return this.builder.clone();
  }

  async find(condition: Partial<T>): Promise<T> {
    const [record] = await this.queryBuilder.where(condition).select('*');
    return record;
  }

  async insert(entity: Partial<T>) {
    return this.queryBuilder.insert({
      ...entity,
      create_time: Math.floor(dayjs().unix()),
    });
  }

  async delete(condition: Partial<T>) {
    return this.queryBuilder.where(condition).delete();
  }

  async update(condition: Partial<T>, entity: Partial<T>) {
    return this.queryBuilder.where(condition).update({
      ...entity,
      update_time: Math.floor(dayjs().unix()),
    });
  }
}
