const should = require("should");
const ContactsServer = require("../../index");
const request = require("supertest");
const { requests } = require("sinon");
const userModel = require("../users/model.users");

describe("Acceptance tests suitcase example", () => {
  let server;

  before(async () => {
    const userServer = new ContactsServer();
    server = await userServer.startServer();
  });

  after(() => {
    server.close();
  });

  describe("GET /api/contacts", () => {
    it("should return OK", async () => {
      await request(server).get("/api/contacts").expect(200);
    });
  });

  // describe("PATCH /users/avatars", () => {
  //   it("should return 401 error", async () => {
  //     await request(server)
  //       .post("/users/avatars") // какой метод использовать ???
  //       .set("Content-Type", "application/json")
  //       .send({})
  //       .expect(401);
  //   });
  // });
});
