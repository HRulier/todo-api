const envConfig: {
  path: string;
} = {
  path: "./.env.local",
};

// If we are not in docker and run a production build, use .env.prod
// If we are in docker and in production, docker config will set env variables
if (process.env.DOCKER !== "true" && process.env.NODE_ENV === "production") {
  envConfig.path = "./.env.production";
}

if (process.env.NODE_ENV === "test") {
  envConfig.path = "./.env.test";
}

export default envConfig;
