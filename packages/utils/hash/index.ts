import * as bcrypt from 'bcrypt'

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, 10)

export const comparePassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash)
