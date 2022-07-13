import {NextFunction, Request, Response} from 'express';
import jwt  from "jsonwebtoken"
declare module 'jsonwebtoken' {
  export interface UserIDJwtPayload extends jwt.JwtPayload {
    id: string
  }
}

const authorizationMiddleware = (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
  const token:string|null = request.headers.authorization?.split(' ')[1]! ;

    if(!token) {
        return response.status(400).json({
            message: 'Token not provided'
        })
    }

    try {

      const payload = <jwt.UserIDJwtPayload>jwt.verify(token, process.env.JWT_SECRET || 'SECRET')

      if(!payload) {
          return response.status(401).json({
              message: 'invalid Token'
          })
      }

        response.locals.userId = payload.id

        next()
    } catch (error) {
        console.error(error)
        return response.status(500).json({
            error: error.message
        })
    }
};
export default authorizationMiddleware;
