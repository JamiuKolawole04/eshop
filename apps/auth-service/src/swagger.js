import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Eshop Auth Service API",
    description: "Auth service for Eshop application",
    version: "1.0.0",
  },
  host: ["localhost:6001"],
  schemes: ["http"],
  // servers: [
  //   {
  //     url: "http://localhost:6001",
  //     description: "Development server",
  //   },
  // ],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.route.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
