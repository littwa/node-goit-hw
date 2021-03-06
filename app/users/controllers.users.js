const modelUsers = require("./model.users");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const path = require("path");
const { promises: fsPromises } = require("fs");
const fs = require("fs");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const Avatar = require("avatar-builder");

const uuid = require("uuid");
const sgMail = require("@sendgrid/mail");

class Controllers {
  constructor() {
    this.tokenTime = "72h";
  }
  multerMiddlware = () => {
    const storage = multer.diskStorage({
      destination: "tmp",
      filename: function (req, file, cb) {
        const ext = path.parse(file.originalname).ext;
        cb(null, Date.now() + ext);
      },
    });

    return multer({ storage });
  };

  avatarGenerate = async (req, res, next) => {
    if (!req.file) {
      const randomColor = "#" + (((1 << 24) * Math.random()) | 0).toString(16);
      const randomNum = Math.floor(Math.random() * (12 - 3)) + 3;

      const avatar = Avatar.squareBuilder(128, randomNum, [randomColor, "#ffffff"], {
        cache: null,
      });

      const buffer = await avatar.create("gabriel");
      const filename = Date.now() + ".png";
      const destination = "tmp";
      await fs.writeFileSync(`${destination}/${filename}`, buffer);
      req.file = { destination, filename, path: `${destination}/${filename}` };
    }
    next();
  };

  imageMini = async (req, res, next) => {
    if (!req.file) {
      return next();
    }
    try {
      const MINI_IMG = "public/images";
      await imagemin([`${req.file.destination}/*.{jpg,png}`], {
        destination: MINI_IMG,
        plugins: [
          imageminJpegtran(),
          imageminPngquant({
            quality: [0.6, 0.8],
          }),
        ],
      });

      const { filename, path: draftPath } = req.file;

      await fsPromises.unlink(draftPath);

      req.file = {
        ...req.file,
        path: path.join(MINI_IMG, filename),
        destination: MINI_IMG,
      };

      next();
    } catch (err) {
      next(err);
    }
  };

  registerUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const isExisted = await modelUsers.findOne({ email });
      if (isExisted) {
        return res.status(409).send("Email in use");
      }

      const hashPass = await bcrypt.hash(password, 5);

      const user = await modelUsers.create({
        ...req.body,
        password: hashPass,
        avatarURL: "http://localhost:3000/images/" + req.file.filename,
      });
      this.createAndSendVerifyToken(user._id, user.email);
      return res.status(201).send({ user: { email: user.email, subscription: user.subscription } });
    } catch (err) {
      next(err.message);
    }
  };

  loginUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const isExisted = await modelUsers.findOne({ email });
      const isValidPass = isExisted && (await bcrypt.compare(password, isExisted.password));

      if (!isExisted || !isValidPass) {
        return res.status(401).send("Email or password is wrong");
      }

      const token = await jwt.sign({ id: isExisted.id }, process.env.TOKEN_SECRET, {
        expiresIn: this.tokenTime,
      });

      const updatedUser = await modelUsers.findByIdAndUpdate(
        isExisted.id,
        {
          token,
        },
        { new: true, useFindAndModify: false },
      );

      return res.status(200).send({
        token: updatedUser.token,
        user: {
          email: updatedUser.email,
          subscription: updatedUser.subscription,
        },
      });
    } catch (err) {
      next(err.message);
    }
  };

  authorization = async (req, res, next) => {
    try {
      const authoriz = req.get("Authorization") || "";
      const token = authoriz.slice(7);

      if (!authoriz) {
        return res.status(401).send({
          message: "Not authorized",
        });
      }

      let userId;
      try {
        userId = (await jwt.verify(token, process.env.TOKEN_SECRET)).id;
      } catch (err) {
        return res.status(401).send(err.message);
      }

      const user = await modelUsers.findById(userId);

      if (!user || user.token !== token) {
        return res.status(401).send({
          message: "Not authorized",
        });
      }

      req.user = user;
      req.token = token;

      next();
    } catch (err) {
      next(err.message);
    }
  };

  logoutUser = async (req, res, next) => {
    try {
      const userWithoutToken = await modelUsers.findByIdAndUpdate(
        req.user._id,
        {
          token: "",
        },
        { new: true, useFindAndModify: false },
      );
      if (!userWithoutToken) {
        return res.status(401).send({
          message: "Not authorized",
        });
      }
      return res.status(204).send();
    } catch (err) {
      next(err.message);
    }
  };

  getCurrentUser = async (req, res, next) => {
    try {
      const currentUser = await modelUsers.findById(req.user._id);
      if (!currentUser) {
        return res.status(401).send({
          message: "Not authorized",
        });
      }
      return res
        .status(200)
        .send({ email: currentUser.email, subscription: currentUser.subscription });
    } catch (err) {
      next(err.message);
    }
  };

  updateUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (email) {
        const isExisted = await modelUsers.findOne({ email });
        if (isExisted) {
          return res.status(409).send("Email in use");
        }
      }
      if (password) {
        const hashPass = await bcrypt.hash(password, 5);
        req.body.password = hashPass;
      }
      if (req.file) {
        let oldImg = req.user.avatarURL.replace("http://localhost:3000/images/", "");

        await fsPromises.unlink("public/images/" + oldImg);
        req.body.avatarURL = "http://localhost:3000/images/" + req.file.filename;
      }

      const userUpdated = await modelUsers.findByIdAndUpdate(
        req.user._id,
        {
          ...req.body,
        },
        { new: true, useFindAndModify: false },
      );

      if (!userUpdated) {
        return res.status(401).send({
          message: "Not authorized",
        });
      }

      res.status(200).send(userUpdated);
    } catch (err) {
      next(err);
    }
  };

  validRegisterUser = (req, res, next) => {
    const validSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      subscription: Joi.string(),
    });
    const { error } = validSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.message);
    }
    next();
  };

  validLoginUser = (req, res, next) => {
    const validSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    const { error } = validSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.message);
    }
    next();
  };

  validUpdateUser = (req, res, next) => {
    const validSchema = Joi.object({
      email: Joi.string(),
      password: Joi.string(),
      subscription: Joi.string(),
    });
    const { error } = validSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.message);
    }
    next();
  };

  createAndSendVerifyToken = async (userId, userEmail) => {
    try {
      const verificationToken = uuid.v4();

      await modelUsers.findByIdAndUpdate(
        userId,
        { verificationToken },
        { new: true, useFindAndModify: false },
      );

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: userEmail,
        from: process.env.SENDGRID_VERIFIED_SENDER,
        subject: "Email verification",
        text: "Verification!",
        html: `<a href='http://localhost:3000/api/auth/verify/${verificationToken}'>Click here for verification!</a>`,
      };

      const resultSendEmail = await sgMail.send(msg);
    } catch (err) {
      next(err.message);
    }
  };

  verificationUser = async (req, res, next) => {
    try {
      const { token: verificationToken } = req.params;

      const isUserForVerify = await modelUsers.findOne({ verificationToken });
      if (!isUserForVerify) {
        throw new Error("404 User not found");
      }

      await modelUsers.findByIdAndUpdate(
        isUserForVerify._id,
        {
          status: "Verified",
          verificationToken: "",
        },
        { new: true, useFindAndModify: false },
      );

      return res.status(200).send("User successfully verified!!!");
    } catch (err) {
      next(err.message);
    }
  };
}

module.exports = new Controllers();
