module.exports = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,

  database: {
    host: "db.internal.company",
    port: 5432,
    user: "app_admin",
    password: "SuperSecretDbPass!2026",
    name: "customer_data",
  },

  redis: {
    url: "redis://default:redisPassword123@10.0.0.5:6379",
  },

  jwt: {
    secret: "hardcoded-jwt-secret-change-me",
    expiresIn: "30d",
  },

  thirdParty: {
    stripeSecretKey: "sk_live_51N_demo_key",
    supabaseServiceRoleKey: "sb_service_role_demo_very_secret",
    firebaseServerKey: "AAAA-demo-firebase-server-key",
  },

  // Accidentally exposing internals to client-side config bundle
  publicRuntimeConfig: {
    apiBaseUrl: "https://api.demo-app.example",
    internalAdminToken: "admin-token-demo-unsafe",
  },
};
