import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import { User } from "../models/User.js";
import { Comment } from "../models/Comment.js";

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
    await Comment.deleteMany();
    await User.deleteMany();
});

describe("GET /api/comment", () => {
    it("should fetch all comments", async () => {
        const res = await request(app).get("/api/comment/comments/:postId")

        expect(res.statusCode).toBe(200);
    })

    it("should fetch a comment by id", async () => {
        const comment = await Comment.create({
            post_id: "68bdb09e21fa278442252826",
            content: "Original Content",
            author_id: "68ba9eadbf2e805b08eaec0e",
        });

        // request it by id
        const res = await request(app).get(`/api/comment/readsinglecomm/${comment._id}`);

        expect(res.statusCode).toBe(200);
    });
});

describe('PUT /api/comment', (req, res) => {
    it('should update an existing comment', async () => {
        const comment = await Comment.create({
            post_id: "68bdb09e21fa278442252826",
            content: "Original Content",
            author_id: "68ba9eadbf2e805b08eaec0e",
        });

        // request it by id
        const res = await request(app).put(`/api/comment/updatecomment/${comment._id}`).send({ content: "New title" })

        expect(res.statusCode).toBe(200);

    });

    it('should return 404 for non-existent comment', async () => {
        const res = await request(app)
            .put('/api/comment/updatecomment/999')
            .send({ content: 'Anything' });

        expect(res.statusCode).toBe(404);
    });

    it('should return 400 if content is missing', async () => {
        const postRes = await request(app)
            .post('/api/comment/updatecomment')
            .send({ content: 'Test' });

        const commentId = postRes.body.id;

        const res = await request(app)
            .put(`/api/comment/updatecomment/${commentId}`)
            .send({});

        expect(res.statusCode).toBe(400);
    });
})

describe('DELETE /api/comment', () => {
    it('should delete an existing comment', async () => {
        const postRes = await request(app)
            .post('/api/post/addcomment/')
            .send({ content: 'To Delete' });

        const commentId = postRes.body.id;

        const deleteRes = await request(app).delete(`/api/comment/deletecomment/${commentId}`);

        expect(deleteRes.statusCode).toBe(200);
    });

    it('should return 404 for non-existent comment', async () => {
        const res = await request(app).delete('/api/comment/deletecomment/999');
        expect(res.statusCode).toBe(404);
    });
});

describe('POST /api/comment', () => {
    it('should create a new comment', async () => {
        const res = await request(app)
            .post('/api/commment/addcomment')
            .send({ content: 'Test Comment' });

        expect(res.statusCode).toBe(201);
    })
});
