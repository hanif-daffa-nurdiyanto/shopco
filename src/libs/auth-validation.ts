type SignUpInput = {
  email: string
  name: string
  password: string
  passwordConfirmation: string
}

class AuthValidationError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'AuthValidationError'
    this.status = status
  }
}

const readText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const parseSignUpInput = (value: unknown): SignUpInput => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AuthValidationError('Please complete all required fields.')
  }

  const input = value as Record<string, unknown>
  const name = readText(input.name)
  const email = readText(input.email).toLowerCase()
  const password = typeof input.password === 'string' ? input.password : ''
  const passwordConfirmation =
    typeof input.passwordConfirmation === 'string' ? input.passwordConfirmation : ''

  if (name.length < 2 || name.length > 100) {
    throw new AuthValidationError('Name must contain between 2 and 100 characters.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new AuthValidationError('Enter a valid email address.')
  }

  if (password.length < 8 || password.length > 128) {
    throw new AuthValidationError('Password must contain between 8 and 128 characters.')
  }

  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    throw new AuthValidationError('Password must include at least one letter and one number.')
  }

  if (password !== passwordConfirmation) {
    throw new AuthValidationError('Passwords do not match.')
  }

  return { email, name, password, passwordConfirmation }
}

export { AuthValidationError, parseSignUpInput }
export type { SignUpInput }
