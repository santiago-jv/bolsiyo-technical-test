import {Entity, model, property, hasMany} from '@loopback/repository';
import {Product} from './product.model';

@model()
export class Company extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  address: string;

  @hasMany(() => Product)
  products: Product[];


  constructor(data?: Partial<Company>) {
    super(data);
  }
}

export interface CompanyRelations {
    // describe navigational properties here
}

export type CompanyWithRelations = Company & CompanyRelations;
