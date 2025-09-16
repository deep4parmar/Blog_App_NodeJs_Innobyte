import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import { Post } from "../models/Post.js";
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
    await Post.deleteMany();
    await User.deleteMany();
});

describe("GET /api/post", () => {
    it("should fetch all posts", async () => {
        const res = await request(app).get("/api/post/getposts")

        expect(res.statusCode).toBe(200);
    })

    it("should fetch a post by id", async () => {
        const post = await Post.create({
            title: "Original Title",
            content: "Original Content",
            author_id: "68ba9eadbf2e805b08eaec0e",
        });

        // request it by id
        const res = await request(app).get(`/api/post/getpost/${post._id}`);

        expect(res.statusCode).toBe(200);
    });
});

describe('PUT /api/post', (req, res) => {
    it('should update an existing post', async () => {
        const post = await Post.create({
            title: "Original Title",
            content: "Original Content",
            author_id: '68ba9eadbf2e805b08eaec0e'
        });

        // request it by id
        const res = await request(app).put(`/api/post/updatepost/${post._id}`).send({ title: "New title" })

        expect(res.statusCode).toBe(200);

    });

    it('should return 404 for non-existent post', async () => {
        const res = await request(app)
            .put('/api/post/updatepost/999')
            .send({ title: 'Anything' });

        expect(res.statusCode).toBe(404);
    });

    it('should return 400 if title is missing', async () => {
        const postRes = await request(app)
            .post('/api/post/updatepost')
            .send({ title: 'Test' });

        const postId = postRes.body.id;

        const res = await request(app)
            .put(`/api/post/updatepost/${postId}`)
            .send({});

        expect(res.statusCode).toBe(400);
    });
})

describe('DELETE /api/post', () => {
    it('should delete an existing post', async () => {
        const postRes = await request(app)
            .post('/api/post/addpost/')
            .send({ title: 'To Delete' });

        const postId = postRes.body.id;

        const deleteRes = await request(app).delete(`/api/post/deletepost/${postId}`);

        expect(deleteRes.statusCode).toBe(200);
    });

    it('should return 404 for non-existent post', async () => {
        const res = await request(app).delete('/api/post/deletepost/999');
        expect(res.statusCode).toBe(404);
    });
});

describe('POST /api/post', () => {
    it('should create a new post', async () => {
        const res = await request(app)
            .post('/api/post/addpost')
            .send({ title: 'Test Item' });

        expect(res.statusCode).toBe(201);
    })
});
