const should = require("should");
const sinon = require("sinon");
const controllersUsers = require("../users/controllers.users");
const userModel = require("../users/model.users");
const jwt = require("jsonwebtoken");

describe("unit test", () => {
  describe("#CheckAutorizationNoToken", () => {
    let sandbox;
    let actualResult;
    let findByIdStub;
    let jwtStub;
    let nextStub;
    let reqStub = {
      get() {},
    };
    let resStub = {
      status() {},
      send() {},
    };

    before(async () => {
      sandbox = sinon.createSandbox();
      findByIdStub = sandbox.stub(userModel, "findById");
      jwtStub = sandbox.stub(jwt, "verify");

      sandbox.stub(reqStub, "get").returns("");
      sandbox.stub(resStub, "status").returns(401);
      sandbox.stub(resStub, "send").returns({
        message: "Not authorized",
      });
      nextStub = sandbox.stub();

      // console.log(reqStub.get());
      // console.log(resStub.status());
      // console.log(resStub.send());

      try {
        actualResult = await controllersUsers.authorization(reqStub, resStub, nextStub);
      } catch (err) {
        actualResult = err;
      }
    });

    after(() => {
      sandbox.restore();
    });

    it("Should return expect result", () => {
      console.log(actualResult);
    });
  });
});
