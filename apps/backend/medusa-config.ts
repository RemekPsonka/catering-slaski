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
    disable: process.env.DISABLE_ADMIN === "true",
    path: "/admin",
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
  modules: [
    // TEMPORARILY DISABLED for diagnostic
    // { resolve: "./src/modules/delivery-zones" },
    // { resolve: "./src/modules/time-slots" },
    // { resolve: "./src/modules/catering-attributes" },
    // { resolve: "./src/modules/subscriptions" },
    // { resolve: "./src/modules/loyalty" },
    // { resolve: "./src/modules/external-webhooks" },
  ],
})
