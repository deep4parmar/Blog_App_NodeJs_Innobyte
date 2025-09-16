import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import { User } from "../models/User.js";

let mongo;

beforeAll(async () => {
    process.env.ACCESS_TOKEN_SECRET = "blog-backend";
    process.env.ACCESS_TOKEN_EXPIRY = "2h";

    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
});

afterEach(async () => {
    await User.deleteMany();
});

describe("POST /api/users", () => {
    it("should register a new user", async () => {
        const res = await request(app)
            .post("/api/users/register")
            .send({ username: "test003", email: "test003@gmail.com", password: "test@003" });

        expect(res.statusCode).toBe(201);
    });

    it("should not register user with missing fields", async () => {
        const res = await request(app)
            .post("/api/users/register")
            .send({ email: "test003@gmail.com" });

        expect(res.statusCode).toBe(400);
    });

    it("should login a registered user", async () => {
        // create user directly in db
        await request(app)
            .post("/api/users/register")
            .send({ username: "test003", email: "test003@gmail.com", password: "test@003" });

        const res = await request(app)
            .post("/api/users/login")
            .send({ email: "test003@gmail.com", password: "test@003" });

        expect(res.statusCode).toBe(200);
    });
});

describe('GET /api/users', () => {


    it("should fetch current user", async () => {
        await request(app).post("/api/users/register")
            .send({ username: "test003", email: "test003@gmail.com", password: "test@003" });

        // Login
        const loginRes = await request(app).post("/api/users/login")
            .send({ email: "test003@gmail.com", password: "test@003" });

        const cookie = loginRes.headers["set-cookie"];

        // Fetch current user
        const res = await request(app).get("/api/users/current-user")
            .set("Cookie", cookie);

        expect(res.statusCode).toBe(200);
    });
})

