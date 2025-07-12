import { sign, verify } from 'jsonwebtoken'

export const generateToken = (payload: any, secret: string, expiresIn = '1h') =>
  sign(payload, secret, { expiresIn })

export const verifyToken = (token: string, secret: string) =>
  verify(token, secret)
