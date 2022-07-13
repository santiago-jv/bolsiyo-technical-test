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
import {Product} from '../models';
import {ProductRepository} from '../repositories';

export class ProductsController {
  constructor(
    @repository(ProductRepository)
    public productRepository : ProductRepository,
  ) {}



  @get('/products/top-price')
  @response(200, {
    description: 'Top 5 Cost Products',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async getTopProductsByPrice(): Promise<Product[]> {
    return this.productRepository.find({
      order:['price DESC'],
      limit:5,
      where: {
        quantity:{
          gt:10
        }
      }
    });
  }

  @get('/products/{id}')
  @response(200, {
    description: 'Product model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Product, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Product, {exclude: 'where'}) filter?: FilterExcludingWhere<Product>
  ): Promise<Product> {
    return this.productRepository.findById(id, filter);
  }


  @put('/products/{id}')
  @response(204, {
    description: 'Product PUT success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() product: Product,
  ): Promise<Product> {
    await this.productRepository.updateById(id, product);
    return await this.productRepository.findById(id)
  }

  @del('/products/{id}')
  @response(204, {
    description: 'Product DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.productRepository.deleteById(id);
  }
}
