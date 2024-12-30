import { Repository, FindOptionsWhere, DataSource, EntityTarget } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { QueryResult, QueryOptions } from './interfaces';

export class BaseRepository<T> extends Repository<T> {
  /**
   * Custom pagination query for documents with sorting, projection, and population
   * @param {FindOptionsWhere<T>} filter - Postgres filter object
   * @param {QueryOptions} options - Query options
   * @returns {Promise<QueryResult>}
   */
  async paginate(
    filter: FindOptionsWhere<T> = {},
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // Apply sorting
    let order: any = {};
    if (options.sortBy) {
      options.sortBy.split(',').forEach((sortOption) => {
        const [field, orderBy] = sortOption.split(':');
        order[field] = orderBy === 'desc' ? 'DESC' : 'ASC';
      });
    }

    // Apply projection (select fields)
    let select: (keyof T)[] = [];
    if (options.projectBy) {
      select = options.projectBy.split(',') as (keyof T)[];
    }

    // Apply relations (populate)
    let relations: string[] = [];
    if (options.populate) {
      relations = options.populate.split(',');
    }

    // Get total count and results
    const [results, totalResults] = await this.findAndCount({
      where: filter,
      take: limit,
      skip: skip,
      order: order,
      select: select.length ? select : undefined,
      relations: relations.length ? relations : undefined,
    });

    // Convert results to plain objects for serialization
    const plainResults = instanceToPlain(results) as any[] | any;

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results: plainResults,  // Return plain JavaScript objects
      page,
      limit,
      totalPages,
      totalResults,
    };
  }
}


export function getCustomRepository<T>(
  entity: EntityTarget<T>,
  dataSource: DataSource
): BaseRepository<T> {
  const repository = dataSource.getRepository(entity) as unknown as BaseRepository<T>;
  Object.setPrototypeOf(repository, BaseRepository.prototype);
  return repository;
}