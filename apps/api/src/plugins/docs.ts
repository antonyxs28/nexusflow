import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import apiReference from "@scalar/fastify-api-reference";

async function docsPluginInner(server: FastifyInstance) {
  server.addSchema({
    $id: "SafeUser",
    type: "object",
    description: "User object without password",
    properties: {
      id: { type: "string", format: "uuid", description: "User ID" },
      name: { type: "string", description: "User full name" },
      email: { type: "string", format: "email", description: "User email" },
      role: { type: "string", nullable: true, description: "User role" },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Creation timestamp",
      },
    },
    required: ["id", "name", "email", "createdAt"],
  });

  server.addSchema({
    $id: "AuthResponse",
    type: "object",
    description: "Authentication response with JWT token",
    properties: {
      token: {
        type: "string",
        description: "JWT access token (expires in 7 days)",
      },
      user: { $ref: "SafeUser" },
    },
    required: ["token", "user"],
  });

  server.addSchema({
    $id: "Client",
    type: "object",
    description: "Client object",
    properties: {
      id: { type: "string", format: "uuid", description: "Client ID" },
      name: { type: "string", description: "Client name" },
      email: { type: "string", format: "email", description: "Client email" },
      company: { type: "string", description: "Client company name" },
      status: {
        type: "string",
        enum: ["active", "inactive", "churned", "lead"],
        description: "Client status",
      },
      plan: {
        type: "string",
        enum: ["free", "starter", "pro", "enterprise"],
        description: "Subscription plan",
      },
      mrr: { type: "string", description: "Monthly recurring revenue" },
      ownerId: {
        type: "string",
        format: "uuid",
        description: "Owner user ID",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Creation timestamp",
      },
    },
    required: [
      "id",
      "name",
      "email",
      "company",
      "status",
      "plan",
      "mrr",
      "ownerId",
      "createdAt",
    ],
  });

  server.addSchema({
    $id: "Error",
    type: "object",
    description: "Error response",
    properties: {
      message: { type: "string", description: "Error message" },
    },
    required: ["message"],
  });

  server.addSchema({
    $id: "ValidationError",
    type: "object",
    description: "Validation error response",
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
  });

  server.addSchema({
    $id: "DashboardOverview",
    type: "object",
    description: "Dashboard overview metrics",
    properties: {
      totalRevenue: { type: "string", description: "Total revenue" },
      totalRevenueGrowth: {
        type: "number",
        description: "Revenue growth percentage",
      },
      activeUsers: { type: "number", description: "Active users count" },
      activeUsersGrowth: {
        type: "number",
        description: "User growth percentage",
      },
      churnRate: { type: "number", description: "Churn rate percentage" },
      churnRateGrowth: {
        type: "number",
        description: "Churn rate growth percentage",
      },
      averageRevenuePerUser: {
        type: "number",
        description: "Average revenue per user",
      },
      mrr: { type: "string", description: "Monthly recurring revenue" },
    },
    required: [
      "totalRevenue",
      "totalRevenueGrowth",
      "activeUsers",
      "activeUsersGrowth",
      "churnRate",
      "churnRateGrowth",
      "averageRevenuePerUser",
      "mrr",
    ],
  });

  server.addSchema({
    $id: "RevenueAnalytics",
    type: "object",
    description: "Revenue analytics data",
    properties: {
      monthlyRevenue: {
        type: "array",
        description: "Monthly revenue breakdown",
        items: {
          type: "object",
          properties: {
            month: { type: "string", description: "Month (YYYY-MM)" },
            revenue: { type: "string", description: "Revenue for the month" },
          },
          required: ["month", "revenue"],
        },
      },
      mrr: { type: "string", description: "Monthly recurring revenue" },
      arr: {
        type: "string",
        description: "Annual recurring revenue (MRR * 12)",
      },
    },
    required: ["monthlyRevenue", "mrr", "arr"],
  });

  server.addSchema({
    $id: "TrafficAnalytics",
    type: "object",
    description: "Traffic analytics data",
    properties: {
      sources: {
        type: "array",
        description: "Traffic sources breakdown",
        items: {
          type: "object",
          properties: {
            source: { type: "string", description: "Traffic source name" },
            visitors: { type: "number", description: "Visitor count" },
            pageViews: { type: "number", description: "Page view count" },
            leads: { type: "number", description: "Lead count" },
            conversionRate: {
              type: "number",
              description: "Conversion rate percentage",
            },
            percentage: {
              type: "number",
              description: "Percentage of total traffic",
            },
          },
          required: [
            "source",
            "visitors",
            "pageViews",
            "leads",
            "conversionRate",
            "percentage",
          ],
        },
      },
      totals: {
        type: "object",
        description: "Traffic totals",
        properties: {
          visitors: { type: "number", description: "Total visitors" },
          pageViews: { type: "number", description: "Total page views" },
          leads: { type: "number", description: "Total leads" },
          averageConversionRate: {
            type: "number",
            description: "Average conversion rate",
          },
        },
        required: ["visitors", "pageViews", "leads", "averageConversionRate"],
      },
    },
    required: ["sources", "totals"],
  });

  server.addSchema({
    $id: "Activity",
    type: "object",
    description: "Recent activity entry",
    properties: {
      id: { type: "string", format: "uuid", description: "Activity ID" },
      action: { type: "string", description: "Action performed" },
      description: { type: "string", description: "Activity description" },
      resource: {
        type: "string",
        nullable: true,
        description: "Resource type",
      },
      resourceId: {
        type: "string",
        nullable: true,
        description: "Resource ID",
      },
      ownerId: {
        type: "string",
        format: "uuid",
        description: "Owner user ID",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Activity timestamp",
      },
    },
    required: ["id", "action", "description", "ownerId", "createdAt"],
  });

  server.addSchema({
    $id: "RecentActivity",
    type: "object",
    properties: {
      activities: {
        type: "array",
        description: "Recent activities",
        items: { $ref: "Activity" },
      },
    },
    required: ["activities"],
  });

  server.addSchema({
    $id: "ClientListResponse",
    type: "object",
    properties: {
      clients: {
        type: "array",
        items: { $ref: "Client" },
      },
    },
    required: ["clients"],
  });

  server.addSchema({
    $id: "ClientSingleResponse",
    type: "object",
    properties: {
      client: { $ref: "Client" },
    },
    required: ["client"],
  });

  server.addSchema({
    $id: "UserSingleResponse",
    type: "object",
    properties: {
      user: { $ref: "SafeUser" },
    },
    required: ["user"],
  });

  server.addSchema({
    $id: "DashboardOverviewResponse",
    type: "object",
    properties: {
      overview: { $ref: "DashboardOverview" },
    },
    required: ["overview"],
  });

  await server.register(swagger, {
    refResolver: {
      buildLocalReference(json, _baseUri, _fragment, _i) {
        return (json.$id as string) || `def-${_i}`;
      },
    },
    openapi: {
      info: {
        title: "NexusFlow API",
        description:
          "NexusFlow SaaS Platform API — Manage clients, analytics, subscriptions, and more.",
        version: "1.0.0",
        contact: {
          name: "NexusFlow Support",
          email: "support@nexusflow.io",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      externalDocs: {
        description: "Find more about NexusFlow",
        url: "https://nexusflow.io/docs",
      },
      servers: [
        {
          url: "http://localhost:3001",
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description:
              "Enter your JWT token. Example: `eyJhbGciOiJIUzI1NiIs...`",
          },
        },
      },
      tags: [
        {
          name: "Auth",
          description: "Authentication and user management endpoints",
        },
        {
          name: "Clients",
          description: "Client CRUD management endpoints",
        },
        {
          name: "Analytics",
          description: "Analytics and reporting endpoints",
        },
        {
          name: "Health",
          description: "Health check and monitoring endpoints",
        },
      ],
    },
  });

  await server.register(apiReference, {
    routePrefix: "/reference",
    configuration: {
      title: "NexusFlow API Reference",
      hideDownloadButton: false,
    },
  });
}

export const docsPlugin = fp(docsPluginInner, {
  name: "docs-plugin",
});
