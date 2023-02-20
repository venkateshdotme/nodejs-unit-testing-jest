const request = require("supertest");
const { response } = require("../../app");

const app = require("../../app");
const newTodo = require("../mock-data/newTodo.json");

let firstTodo, newTodoId;
const nonExistingId = "someRandomId";
const testData = { title: "Make integration test for PUT", done: true };

const endpointUrl = "/todos/";

describe(endpointUrl, () => {
    test("GET " + endpointUrl, async () => {
        const response = await request(app).get(endpointUrl);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body[0].title).toBeDefined();
        expect(response.body[0].done).toBeDefined();
        firstTodo = response.body[0];
    });

    test("GET by ID " + endpointUrl + ":todoId", async () => {
        const response = await request(app).get(endpointUrl + firstTodo._id);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(firstTodo.title);
        expect(response.body.done).toBe(firstTodo.done);
    });

    test("GET todo by ID " + endpointUrl + ":todoId", async () => {
        const response = await request(app).get(endpointUrl + "someRandomId");
        expect(response.statusCode).toBe(404);
    });

    it("POST " + endpointUrl, async () => {
        const response = await request(app).post(endpointUrl).send(newTodo);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(newTodo.title);
        expect(response.body.done).toBe(newTodo.done);
        newTodoId = response.body._id;
    });

    it(
        "should return error 500 on malformed data with POST" + endpointUrl,
        async () => {
        const response = await request(app)
            .post(endpointUrl)
            .send({ title: "Missing done property" });
        expect(response.statusCode).toBe(500);
        expect(response.body).toStrictEqual({
            message: "Todo validation failed: done: Path `done` is required.",
        });
        }
    );

    it("PUT " + endpointUrl, async () => {
        const res = await request(app)
        .put(endpointUrl + newTodoId)
        .send(testData);
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe(testData.title);
        expect(res.body.done).toBe(testData.done);
    });

    it("should return 404 on PUT", async () => {
        const res = await request(app)
        .put(endpointUrl + nonExistingId)
        .send(testData);
        expect(res.statusCode).toBe(404);
    });

    test("DELETE " + endpointUrl, async () => {
        const res = await request(app)
        .delete(endpointUrl + newTodoId)
        .send();
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe(testData.title);
        expect(res.body.done).toBe(testData.done);
    });

    it("should return 404 on Delete", async () => {
        const res = await request(app)
        .delete(endpointUrl + nonExistingId)
        .send(testData);
        expect(res.statusCode).toBe(404);
    });
});
