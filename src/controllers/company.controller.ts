import { intercept} from '@loopback/core';
import {
    Filter,
    FilterExcludingWhere,
    repository,
} from '@loopback/repository';
import {
    post,
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
import {Company} from '../models';
import {CompanyRepository} from '../repositories';

export class CompanyController {
    constructor(
        @repository(CompanyRepository)
        public companyRepository: CompanyRepository,
    ) {}

    @intercept(toInterceptor(authorizationMiddleware))
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
    @intercept(toInterceptor(authorizationMiddleware))
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

    ): Promise<Company[]> {
        return this.companyRepository.find();
    }
    @intercept(toInterceptor(authorizationMiddleware))
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
    async getCountOfProductsPerCompany(): Promise<any> {
        const response = await this.companyRepository.execute(
            'SELECT company.name as companyName, COUNT(product.id) as productsCount FROM company INNER JOIN  product ON product.companyId = company.id GROUP BY company.name;',
        );
        return response;
    }
    @intercept(toInterceptor(authorizationMiddleware))
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
    ): Promise<Company> {
        return this.companyRepository.findById(id);
    }

    @intercept(toInterceptor(authorizationMiddleware))
    @put('/companies/{id}')
    @response(204, {
        description: 'Company PUT success',

    })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Company, {
                        title: 'NewCompany',
                        exclude: ['id'],
                    }),
                },
            },
        }) company: Company,
    ): Promise<Company> {
        await this.companyRepository.updateById(id, company);
        return await this.companyRepository.findById(id);
    }

    @intercept(toInterceptor(authorizationMiddleware))
    @del('/companies/{id}')
    @response(204, {
        description: 'Company DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.companyRepository.deleteById(id);
        console.log(await this.companyRepository.products(id).delete());
    }
}
