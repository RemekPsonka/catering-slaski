import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

export default defineConfig({
  projectConfig: {
    // Supabase pooler URL dla normalnych queries (transaction mode pgbouncer)
    databaseUrl: process.env.DATABASE_URL,
    // Direct URL dla migracji (bypass pgbouncer — wymagane przez Medusa migrations)
    databaseDriverOptions: {
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      // Supabase wymaga SSL dla zewnętrznych połączeń
      connection: {
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      },
      pool: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
      },
    },
    // Upstash Redis (rediss:// dla TLS)
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7001,http://localhost:9000",
      authCors: process.env.AUTH_CORS || "http://localhost:3000,http://localhost:7001",
      jwtSecret: process.env.JWT_SECRET || "supersecret_change_me",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret_change_me",
    },
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "server" | "worker" || "shared",
  },

  admin: {
    disable: process.env.DISABLE_ADMIN === "true",
    path: "/admin",
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },

  modules: [
    // ---- Catering custom modules ----
    {
      resolve: "./src/modules/delivery-zones",
    },
    {
      resolve: "./src/modules/time-slots",
    },
    {
      resolve: "./src/modules/catering-attributes",
    },
    {
      resolve: "./src/modules/external-webhooks",
      options: {
        production: {
          url: process.env.WEBHOOK_PRODUCTION_URL,
          secret: process.env.WEBHOOK_PRODUCTION_SECRET,
        },
        logistics: {
          url: process.env.WEBHOOK_LOGISTICS_URL,
          secret: process.env.WEBHOOK_LOGISTICS_SECRET,
        },
        billing: {
          url: process.env.WEBHOOK_BILLING_URL,
          secret: process.env.WEBHOOK_BILLING_SECRET,
        },
      },
    },

    // ---- Payment: Stripe with BLIK + cards ----
    {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              automatic_payment_methods: true,
              payment_description: "Catering Śląski",
              capture: true,
            },
          },
        ],
      },
    },

    // ---- Notifications: Resend (email) + SMSAPI (sms) ----
    {
      resolve: "@medusajs/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/notification-resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
            },
          },
          {
            resolve: "./src/modules/notification-smsapi",
            id: "smsapi",
            options: {
              channels: ["sms"],
              token: process.env.SMSAPI_TOKEN,
              sender: process.env.SMSAPI_SENDER,
            },
          },
        ],
      },
    },

    // ---- File storage (local; can switch to S3 in prod) ----
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/static`,
            },
          },
        ],
      },
    },

    // ---- Workflow engine (for AI Generator, slot reservations) ----
    {
      resolve: "@medusajs/workflow-engine-redis",
      options: {
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },

    // ---- Cache ----
    {
      resolve: "@medusajs/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        ttl: 30,
      },
    },

    // ---- Event bus (for cross-module events) ----
    {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },

    // ---- Locking (for slot reservation) ----
    {
      resolve: "@medusajs/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/locking-redis",
            id: "locking-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ],
      },
    },
  ],

  featureFlags: {
    medusa_v2: true,
  },
})
