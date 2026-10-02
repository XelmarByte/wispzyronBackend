import { Router } from 'express'
import { requireAuth } from '@middlewares/require-auth.js'
import { accountRouter } from '@modules/account/account.routes.js'
import { organizationRouter } from '@modules/organization/organization.routes.js'

const router = Router()

// -- API VERSION 1 --
const v1Router = Router()
v1Router.use(requireAuth)
v1Router.use('/account', accountRouter)
v1Router.use('/organizations', organizationRouter)

router.use('/v1', v1Router)

// -- API VERSION 2 --
// const v2Router = Router()
// router.use('/v2', v2Router)
// v2Router.use('/auth', authRouter)
// v2Router.use('/users', userRouter)

export default router
