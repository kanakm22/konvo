const IS_PROD = process.env.NODE_ENV === "production";

const server = IS_PROD 
    ? "https://konvobackend.onrender.com" 
    : "http://localhost:8000";

export default server;