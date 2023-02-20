const httpMocks = require("node-mocks-http");

const TodoController = require("../../controllers/todo.controller");
const TodoModel = require("../../models/todo.model");
const newTodo = require("../mock-data/newTodo.json");
const allTodos = require("../mock-data/all-todos.json");
const singleTodo = require("../mock-data/todo.json");

// model each method mock implementations
// TodoModel.create = jest.fn();
// TodoModel.find = jest.fn();
// TodoModel.findById = jest.fn();
// TodoModel.findByIdAndUpdate = jest.fn();

// all model mock implementation
jest.mock("../../models/todo.model.js");


let req, res, next;
let todoId = "someRandomId";

beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
});

describe("TodoController.getTodos", () => {

    it("should have a getTodos function", () => {
        expect(typeof TodoController.getTodos).toBe("function");
    });

    it("should call TodoModel.find({})", async () => {
        await TodoController.getTodos(req, res, next);
        expect(TodoModel.find).toBeCalledWith({});
    });

    it("should return response with status 200 and all todos", async () => {
        TodoModel.find.mockReturnValue(allTodos);
        await TodoController.getTodos(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res._isEndCalled()).toBeTruthy();
        expect(res._getJSONData()).toStrictEqual(allTodos);
    });

    it("should handle errors", async () => {
        const errorMessage = {message : "Error finding"};
        const rejectPromise = Promise.reject(errorMessage);
        TodoModel.find.mockReturnValue(rejectPromise);
        await TodoController.getTodos(req, res, next);
        expect(next).toHaveBeenCalledWith(errorMessage);
    });

    it("should return 404 when item doesn't exist", async () => {
        TodoModel.findById.mockReturnValue(null);
        await TodoController.getTodoById(req, res, next);
        expect(res.statusCode).toBe(404);
        expect(res._isEndCalled).toBeTruthy();
    })
});

describe("TodoController.getTodoById", () => {
    it("should have getTodoById function", () => {
        expect(typeof TodoController.getTodoById).toBe("function");
    });

    it("should call TodoModel.findById with route parameters", async () => {
        req.params.todoId = todoId;
        await TodoController.getTodoById(req, res, next);
        expect(TodoModel.findById).toBeCalledWith(todoId);
    });

    it("should return json body and response code 200", async () => {
        TodoModel.findById.mockReturnValue(singleTodo);
        await TodoController.getTodoById(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res._isEndCalled()).toBeTruthy();
        expect(res._getJSONData()).toStrictEqual(singleTodo);
    });

    it("should handle errors", async () => {
        const errorMessage = {message: "error finding todoModel"};
        const rejectedPromise = Promise.reject(errorMessage);
        TodoModel.findById.mockReturnValue(rejectedPromise);
        await TodoController.getTodoById(req, res, next);
        expect(next).toHaveBeenCalledWith(errorMessage);
    });
});

describe("TodoController.createTodo", () => {

    beforeEach(() => {
        req.body = newTodo;
    });

    it("should have a createTodo function", () => {
        expect(typeof TodoController.createTodo).toBe("function");
    });

    it("should call TodoModel.create", () => {
        TodoController.createTodo(req, res, next);
        expect(TodoModel.create).toBeCalledWith(newTodo);
    });

    it("should return 201 response code", async () => {
        await TodoController.createTodo(req, res, null);
        expect(res.statusCode).toBe(201);
        expect(res._isEndCalled()).toBeTruthy();
    });

    it("should return json body in response", async () => {
        TodoModel.create.mockReturnValue(newTodo);
        await TodoController.createTodo(req, res, next);
        expect(res._getJSONData()).toStrictEqual(newTodo);
    });

    it("should handle errors", async () => {
        const errorMessage = {message: "Done property missing"};
        const rejectPromise = Promise.reject(errorMessage);
        TodoModel.create.mockReturnValue(rejectPromise);
        await TodoController.createTodo(req, res, next);
        expect(next).toBeCalledWith(errorMessage)
    });
});

describe("TodoController.updateTodo", () => {
    it("should have an updateTodo function", () => {
        expect(typeof TodoController.updateTodo).toBe("function");
    });

    it("should call TodoModel.findByIdAndUpdate", async () => {
        req.params.todoId = todoId;
        req.body = newTodo;
        await TodoController.updateTodo(req, res, next);
        expect(TodoModel.findByIdAndUpdate).toHaveBeenCalledWith(todoId, newTodo, {
            new: true,
            useFindAndModify: false
        })
    });

    it("should return a response with json data and http code 200", async () => {
        req.params.todoId = todoId;
        req.body = newTodo;
        TodoModel.findByIdAndUpdate.mockReturnValue(newTodo);
        await TodoController.updateTodo(req, res, next);
        expect(res._isEndCalled()).toBeTruthy();
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toStrictEqual(newTodo);
    });

    it("should handle errors", async () => {
        const errorMessage = {message: "Error"};
        const rejectPromise = Promise.reject(errorMessage);
        TodoModel.findByIdAndUpdate.mockReturnValue(rejectPromise);
        await TodoController.updateTodo(req, res, next);
        expect(next).toBeCalledWith(errorMessage)
    });

    it("should handle 404", async () => {
        TodoModel.findByIdAndUpdate.mockReturnValue(null);
        await TodoController.updateTodo(req, res, next);
        expect(res.statusCode).toBe(404);
        expect(res._isEndCalled()).toBeTruthy();
    });
});

describe("TodoController.deleteTodo", () => {
    it("should have a deleteTodo function", () => {
        expect(typeof TodoController.deleteTodo).toBe("function");
    });

    it("should call findByIdAndDelete", async () => {
        req.params.todoId = todoId;
        await TodoController.deleteTodo(req, res, next);
        expect(TodoModel.findByIdAndDelete).toBeCalledWith(todoId);
    });

    it("should return 200 OK nd deleted todoModel", async () => {
        TodoModel.findByIdAndDelete.mockReturnValue(newTodo);
        await TodoController.deleteTodo(req,res,next);
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toStrictEqual(newTodo);
        expect(res._isEndCalled()).toBeTruthy();
    });

    it("should handle errors", async () => {
        const errorMessage = {message: "Error deleting"};
        const rejectPromise = Promise.reject(errorMessage);
        TodoModel.findByIdAndDelete.mockReturnValue(rejectPromise);
        await TodoController.deleteTodo(req, res, next);
        expect(next).toBeCalledWith(errorMessage)
    });

    it("should handle 404", async () => {
        TodoModel.findByIdAndDelete.mockReturnValue(null);
        await TodoController.deleteTodo(req, res, next);
        expect(res.statusCode).toBe(404);
        expect(res._isEndCalled()).toBeTruthy();
    });
});
