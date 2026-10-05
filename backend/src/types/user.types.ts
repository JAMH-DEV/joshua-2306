export interface User {
  id: string
  fullName: string
  email: string
  password: string
  balance: number
  createdAt: Date
}

export interface RegisterUserInput {
  fullName: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}