import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      ssl: { rejectUnauthorized: false },
      connection: { ssl: { rejectUnauthorized: false } },
      pool: { min: 2, max: 10, idleTimeoutMillis: 30000 },
    },
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7001,http://localhost:9000",
      authCors: process.env.AUTH_CORS || "http://localhost:3000,http://localhost:7001",
      jwtSecret: process.env.JWT_SECRET || "supersecret_change_me",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret_change_me",
    },
    workerMode: (process.env.MEDUSA_WORKER_MODE as "shared" | "server" | "worker") || "shared",
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
  modules: [
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: process.env.REDIS_URL, ttl: 30 },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: { redis: { url: process.env.REDIS_URL } },
    },
    { resolve: "./src/modules/delivery-zones" },
    { resolve: "./src/modules/time-slots" },
    { resolve: "./src/modules/catering-attributes" },
    { resolve: "./src/modules/subscriptions" },
    { resolve: "./src/modules/loyalty" },
    { resolve: "./src/modules/external-webhooks" },
    { resolve: "./src/modules/delivery-methods" },
    { resolve: "./src/modules/product-availability" },
    { resolve: "./src/modules/newsletter" },
    { resolve: "./src/modules/dietary-profile" },
    { resolve: "./src/modules/b2b-accounts" },
    { resolve: "./src/modules/production" },
    { resolve: "./src/modules/seo-meta" },
    { resolve: "./src/modules/resend-notification" },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/resend-notification",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM || "onboarding@resend.dev",
              reply_to: process.env.RESEND_REPLY_TO || "zamowienia@cateringslaski.pl",
            },
          },
        ],
      },
    },
  ],
})
