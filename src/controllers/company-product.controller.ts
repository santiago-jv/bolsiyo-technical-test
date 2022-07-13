import {
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Company,
  Product,
} from '../models';
import {CompanyRepository} from '../repositories';

export class CompanyProductController {
  constructor(
    @repository(CompanyRepository) protected companyRepository: CompanyRepository,
  ) { }

  @get('/companies/{id}/products', {
    responses: {
      '200': {
        description: 'Array of Company has many Product',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Product)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.number('limit') limit?: number,
    @param.query.number('offset') offset?: number,
    @param.query.string('search') search: string = '',
  ): Promise<Product[]> {

    const products:Product[] = await this.companyRepository.products(id).find({
      offset,
      limit,
      where: {
        name:{
          like:`${search}%`
        }
      }
    })

    return products;

  }



  @post('/companies/{id}/products', {
    responses: {
      '200': {
        description: 'Company model instance',
        content: {'application/json': {schema: getModelSchemaRef(Product)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Company.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {
            title: 'NewProductInCompany',
            exclude: ['id','companyId'],

          }),
        },
      },
    }) product: Omit<Product, 'id'>,
  ): Promise<Product> {
    return this.companyRepository.products(id).create(product);
  }


}
