import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Company} from '../models';
import {CompanyRepository} from '../repositories';

export class CompanyController {
  constructor(
    @repository(CompanyRepository)
    public companyRepository : CompanyRepository,
  ) {}

  @post('/companies')
  @response(200, {
    description: 'Company model instance',
    content: {'application/json': {schema: getModelSchemaRef(Company)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Company, {
            title: 'NewCompany',
            exclude: ['id'],
          }),
        },
      },
    })
    company: Omit<Company, 'id'>,
  ): Promise<Company> {
    return this.companyRepository.create(company);
  }


  @get('/companies')
  @response(200, {
    description: 'Array of Company model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Company, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Company) filter?: Filter<Company>,
  ): Promise<Company[]> {
    return this.companyRepository.find(filter);
  }

  @get('/companies/count-products')
  @response(200, {
    description: '',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Company, {includeRelations: true}),
        },
      },
    },
  })
  async getCountOfProductsPerCompany(
  ): Promise<any> {
    const response = await this.companyRepository.execute('SELECT company.name as companyName, COUNT(product.id) as productsCount FROM company INNER JOIN  product ON product.companyId = company.id GROUP BY company.name;')
    return response
  }

  @get('/companies/{id}')
  @response(200, {
    description: 'Company model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Company, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Company, {exclude: 'where'}) filter?: FilterExcludingWhere<Company>
  ): Promise<Company> {
    return this.companyRepository.findById(id, filter);
  }


  @put('/companies/{id}')
  @response(204, {
    description: 'Company PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() company: Company,
  ): Promise<Company> {
    await this.companyRepository.updateById(id, company);
    return await this.companyRepository.findById(id)
  }

  @del('/companies/{id}')
  @response(204, {
    description: 'Company DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.companyRepository.deleteById(id);
    console.log(await this.companyRepository.products(id).delete())
  }
}
