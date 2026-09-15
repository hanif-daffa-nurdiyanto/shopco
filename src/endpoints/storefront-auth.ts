import { AuthValidationError, parseSignUpInput } from '@/libs/auth-validation'
import { headersWithCors, type Endpoint, type PayloadRequest } from 'payload'

const responseHeaders = (req: PayloadRequest) =>
  headersWithCors({
    headers: new Headers({ 'Cache-Control': 'private, no-store' }),
    req,
  })

const assertSameOrigin = (req: PayloadRequest) => {
  const origin = req.headers.get('origin')

  if (origin && origin !== new URL(req.url ?? 'http://localhost').origin) {
    throw new AuthValidationError('Cross-origin signup request rejected.', 403)
  }
}

const toErrorResponse = (req: PayloadRequest, error: unknown) => {
  if (error instanceof AuthValidationError) {
    return Response.json(
      { error: { code: 'invalidRequest', message: error.message } },
      { headers: responseHeaders(req), status: error.status },
    )
  }

  req.payload.logger.error({ err: error, msg: 'Storefront signup failed.' })
  return Response.json(
    { error: { code: 'internalError', message: 'Unable to create your account.' } },
    { headers: responseHeaders(req), status: 500 },
  )
}

const signUpEndpoint: Endpoint = {
  handler: async (req) => {
    try {
      assertSameOrigin(req)
      if (!req.json) throw new AuthValidationError('JSON request body is required.')

      const input = parseSignUpInput(await req.json())
      const [existing, userCount] = await Promise.all([
        req.payload.find({
          collection: 'users',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          pagination: false,
          req,
          select: { email: true },
          where: { email: { equals: input.email } },
        }),
        req.payload.count({ collection: 'users', overrideAccess: true, req }),
      ])

      if (userCount.totalDocs === 0) {
        throw new AuthValidationError(
          'Store setup is incomplete. Create the first administrator in Payload CMS.',
          503,
        )
      }

      if (existing.docs.length > 0) {
        throw new AuthValidationError('An account with this email already exists.', 409)
      }

      const user = await req.payload.create({
        collection: 'users',
        context: { customerSignup: true },
        data: {
          email: input.email,
          name: input.name,
          password: input.password,
          roles: ['customer'],
          status: 'active',
        },
        overrideAccess: true,
        req,
      })

      return Response.json(
        {
          user: {
            email: user.email,
            id: user.id,
            name: user.name,
            roles: user.roles,
          },
        },
        { headers: responseHeaders(req), status: 201 },
      )
    } catch (error) {
      return toErrorResponse(req, error)
    }
  },
  method: 'post',
  path: '/storefront/auth/signup',
}

const storefrontAuthEndpoints = [signUpEndpoint]

export { storefrontAuthEndpoints }
