export const errorResponse = {
  type: "object",
  properties: {
    message: { type: "string", description: "Error message" },
  },
  required: ["message"],
} as const;

export const validationError = {
  type: "object",
  properties: {
    message: { type: "string", description: "Error message" },
    errors: {
      type: "array",
      description: "Validation error details",
      items: {
        type: "object",
        properties: {
          message: { type: "string" },
          path: { type: "array", items: { type: "string" } },
          code: { type: "string" },
        },
      },
    },
  },
  required: ["message"],
} as const;

export const bearerAuth = [{ bearerAuth: [] }];

export const safeUser = {
  type: "object",
  description: "User object without password",
  properties: {
    id: { type: "string", format: "uuid", description: "User ID" },
    name: { type: "string", description: "User full name" },
    email: { type: "string", format: "email", description: "User email" },
    role: { type: "string", nullable: true, description: "User role" },
    createdAt: { type: "string", format: "date-time", description: "Creation timestamp" },
  },
  required: ["id", "name", "email", "createdAt"],
} as const;

export const authResponse = {
  type: "object",
  description: "Authentication response with JWT token",
  properties: {
    token: { type: "string", description: "JWT access token" },
    user: { $ref: "#/components/schemas/SafeUser" },
  },
  required: ["token", "user"],
} as const;

export const clientObject = {
  type: "object",
  description: "Client object",
  properties: {
    id: { type: "string", format: "uuid", description: "Client ID" },
    name: { type: "string", description: "Client name" },
    email: { type: "string", format: "email", description: "Client email" },
    company: { type: "string", description: "Client company" },
    status: { type: "string", description: "Client status", enum: ["active", "inactive", "churned", "lead"] },
    plan: { type: "string", description: "Subscription plan", enum: ["free", "starter", "pro", "enterprise"] },
    mrr: { type: "string", description: "Monthly recurring revenue" },
    ownerId: { type: "string", format: "uuid", description: "Owner user ID" },
    createdAt: { type: "string", format: "date-time", description: "Creation timestamp" },
  },
  required: ["id", "name", "email", "company", "status", "plan", "mrr", "ownerId", "createdAt"],
} as const;

export const clientListResponse = {
  type: "object",
  properties: {
    clients: {
      type: "array",
      items: { $ref: "#/components/schemas/Client" },
    },
  },
  required: ["clients"],
} as const;

export const clientSingleResponse = {
  type: "object",
  properties: {
    client: { $ref: "#/components/schemas/Client" },
  },
  required: ["client"],
} as const;

export const idParams = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid", description: "Resource ID" },
  },
  required: ["id"],
} as const;

export const registerBody = {
  type: "object",
  description: "Registration payload",
  properties: {
    name: { type: "string", minLength: 3, description: "User full name" },
    email: { type: "string", format: "email", description: "User email address" },
    password: { type: "string", minLength: 6, description: "User password (min 6 characters)" },
  },
  required: ["name", "email", "password"],
} as const;

export const loginBody = {
  type: "object",
  description: "Login payload",
  properties: {
    email: { type: "string", format: "email", description: "User email address" },
    password: { type: "string", description: "User password" },
  },
  required: ["email", "password"],
} as const;

export const createClientBody = {
  type: "object",
  description: "Create client payload",
  properties: {
    name: { type: "string", minLength: 2, description: "Client name" },
    email: { type: "string", format: "email", description: "Client email address" },
    company: { type: "string", minLength: 2, description: "Client company name" },
    status: { type: "string", enum: ["active", "inactive", "churned", "lead"], description: "Client status" },
    plan: { type: "string", enum: ["free", "starter", "pro", "enterprise"], description: "Subscription plan" },
    mrr: { type: "string", description: "Monthly recurring revenue" },
  },
  required: ["name", "email", "company"],
} as const;

export const updateClientBody = {
  type: "object",
  description: "Update client payload (all fields optional)",
  properties: {
    name: { type: "string", minLength: 2, description: "Client name" },
    email: { type: "string", format: "email", description: "Client email address" },
    company: { type: "string", minLength: 2, description: "Client company name" },
    status: { type: "string", enum: ["active", "inactive", "churned", "lead"], description: "Client status" },
    plan: { type: "string", enum: ["free", "starter", "pro", "enterprise"], description: "Subscription plan" },
    mrr: { type: "string", description: "Monthly recurring revenue" },
  },
} as const;

export const dashboardOverviewResponse = {
  type: "object",
  properties: {
    overview: {
      type: "object",
      properties: {
        totalRevenue: { type: "string" },
        totalRevenueGrowth: { type: "number" },
        activeUsers: { type: "number" },
        activeUsersGrowth: { type: "number" },
        churnRate: { type: "number" },
        churnRateGrowth: { type: "number" },
        averageRevenuePerUser: { type: "number" },
        mrr: { type: "string" },
      },
      required: ["totalRevenue", "totalRevenueGrowth", "activeUsers", "activeUsersGrowth", "churnRate", "churnRateGrowth", "averageRevenuePerUser", "mrr"],
    },
  },
  required: ["overview"],
} as const;

export const revenueAnalyticsResponse = {
  type: "object",
  properties: {
    monthlyRevenue: {
      type: "array",
      items: {
        type: "object",
        properties: {
          month: { type: "string" },
          revenue: { type: "string" },
        },
        required: ["month", "revenue"],
      },
    },
    mrr: { type: "string" },
    arr: { type: "string" },
  },
  required: ["monthlyRevenue", "mrr", "arr"],
} as const;

export const trafficAnalyticsResponse = {
  type: "object",
  properties: {
    sources: {
      type: "array",
      items: {
        type: "object",
        properties: {
          source: { type: "string" },
          visitors: { type: "number" },
          pageViews: { type: "number" },
          leads: { type: "number" },
          conversionRate: { type: "number" },
          percentage: { type: "number" },
        },
        required: ["source", "visitors", "pageViews", "leads", "conversionRate", "percentage"],
      },
    },
    totals: {
      type: "object",
      properties: {
        visitors: { type: "number" },
        pageViews: { type: "number" },
        leads: { type: "number" },
        averageConversionRate: { type: "number" },
      },
      required: ["visitors", "pageViews", "leads", "averageConversionRate"],
    },
  },
  required: ["sources", "totals"],
} as const;

export const recentActivityResponse = {
  type: "object",
  properties: {
    activities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          action: { type: "string" },
          description: { type: "string" },
          resource: { type: "string", nullable: true },
          resourceId: { type: "string", nullable: true },
          ownerId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "action", "description", "ownerId", "createdAt"],
      },
    },
  },
  required: ["activities"],
} as const;

export const commonResponse = {
  400: { description: "Bad request - validation error", ...validationError },
  401: { description: "Unauthorized - missing or invalid JWT", ...errorResponse },
  404: { description: "Resource not found", ...errorResponse },
  409: { description: "Conflict - resource already exists", ...errorResponse },
  500: { description: "Internal server error", ...errorResponse },
} as const;
