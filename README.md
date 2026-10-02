- Manejar el error de la funcion safeParseWithSchema
- El endpoint para crear orgs solo permite la creacion con planes establecidos, los planes custom solo los podra crear un admin del sistema

### Common types

```ts
type Permission =
  | '*'
  | 'projects:read'
  | 'projects:create'
  | 'projects:delete'
  | 'billing:read'
  | 'billing:manage'
  | 'members:read'
  | 'members:invite'
  | 'roles:manage'

type Plan = 'starter' | 'pro' | 'enterprise'

type SubscriptionStatus =
  'pending_payment' | 'active' | 'past_due' | 'canceled' | 'unpaid'

type FeatureFlag =
  'electronic_invoicing' | 'inventory_management' | 'audit_logs'

interface PlanConfig {
  name: string
  maxStaffMembers: number
  maxSubscribers: number
  maxRouters: number
  features: Record<FeatureFlag, boolean>
}

interface OrganizationContext {
  id: string
  name: string
  slug: string
  logoKey: string | null
  displayName: string
  avatarUrl: string | null
  corporateEmail: string
  role: {
    name: string
    permissions: Permission[]
  }
  plan: {
    tier: Plan
    status: SubscriptionStatus
    config: PlanConfig
  }
}

interface PresignedUrlResponse {
  uploadUrl: string
  fileId: string
}
```

### GET /account/context

```ts
interface Response {
  id: string
  name: string
  email: string
  imageUrl: string | null
  organizations: OrganizationContext[]
}
```

### POST /organizations/logo/presigned-url

```ts
interface Body {
  contentType: 'image/webp'
  size: number
}

type Response = PresignedUrlResponse
```

### POST /organizations

```ts
interface Body {
  name: string
  slug: string
  plan: Plan
  fileId?: string
}

type Response = OrganizationContext
```
