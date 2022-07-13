import {repository} from '@loopback/repository';
import {getModelSchemaRef, post, requestBody} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {hash, compare} from "bcryptjs"
import jwt from "jsonwebtoken"
interface AuthResponse {
	user:User
	token:string
    type:string
}
export class AuthController {
	constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,
    ) {}

    @post('/auth/register', {
        responses: {
            '200': {
                description: 'User model instance',
                content: {
                    'application/json': {schema: getModelSchemaRef(User)},
                },
            },
        },
    })
    async registerUser(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(User, {
                        title: 'Register User',
                        exclude: ['id']
                    }),

                },
            },
        })
        user: Omit<User, 'id'>,
    ): Promise<AuthResponse> {
		const userFromDB:User|null = await this.userRepository.findOne({where:{email:user.email}})

		if(userFromDB) throw new Error('This email already exists')

		user.password = await hash(user.password,10)
		const newUser = await this.userRepository.create(user)
        return {
			user:newUser,
			token:jwt.sign({id:newUser.id},process.env.SECRET_JWT ||'SECRET'),
            type:'Bearer'
		}
    }


    @post('/auth/login', {
        responses: {
            '200': {
                description: 'User model instance',
                content: {
                    'application/json': {schema: getModelSchemaRef(User)},
                },
            },
        },
    })
    async loginUser(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(User, {
                        title: 'Login User',
                        exclude: ['id', 'name']
                    }),

                },
            },
        })
        user: Omit<User, 'id'>,
    ): Promise<AuthResponse> {
		const userFromDB:User|null = await this.userRepository.findOne({where:{email:user.email}})

		if(!userFromDB) throw new Error('User not found')
        if(!await compare(user.password, userFromDB.password)) throw new Error('Invalid credentials')

        return {
			user:userFromDB,
			token:jwt.sign({id:userFromDB.id},process.env.SECRET_JWT ||'SECRET'),
            type:'Bearer'
		}
    }
}
