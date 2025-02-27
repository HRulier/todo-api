const envConfig: {
  path: string;
} = {
  path: "./.env",
};

if (process.env.NODE_ENV === "production") {
  envConfig.path = "./.env.prod";
}

export default envConfig;
