import { intercept} from '@loopback/core';
import {FilterExcludingWhere, repository} from '@loopback/repository';
import {
    param,
    get,
    getModelSchemaRef,
    put,
    del,
    requestBody,
    response,
    toInterceptor,
} from '@loopback/rest';
import authorizationMiddleware from '../interceptors/authorization.interceptor';
import {Product} from '../models';
import {ProductRepository} from '../repositories';

export class ProductsController {
    constructor(
        @repository(ProductRepository)
        public productRepository: ProductRepository,
    ) {}

    @intercept(toInterceptor(authorizationMiddleware))
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
            order: ['price DESC'],
            limit: 5,
            where: {
                quantity: {
                    gt: 10,
                },
            },
        });
    }
    @intercept(toInterceptor(authorizationMiddleware))
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
        @param.path.number('id') id: number
    ): Promise<Product> {
        return this.productRepository.findById(id,);
    }
    @intercept(toInterceptor(authorizationMiddleware))
    @put('/products/{id}')
    @response(204, {
        description: 'Product PUT success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Product, {
                        title: 'New Product',
                        exclude: ['id'],
                    }),
                },
            },
        }) product: Product,
    ): Promise<Product> {
        await this.productRepository.updateById(id, product);
        return await this.productRepository.findById(id);
    }

    @intercept(toInterceptor(authorizationMiddleware))
    @del('/products/{id}')
    @response(204, {
        description: 'Product DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.productRepository.deleteById(id);
    }
}
