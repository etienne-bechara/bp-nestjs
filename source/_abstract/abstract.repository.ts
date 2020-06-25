import { Repository } from 'typeorm';

export class AbstractRepository<T> extends Repository<T> { }
