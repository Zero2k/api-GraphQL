import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getConnection, MoreThan } from 'typeorm';
import jwt from 'jsonwebtoken';

import emailIsValid from '../../utils/emailIsValid';
import mailer from '../../utils/mailer';
import checkAuth from '../../utils/checkAuth';

export default {
  User: {},

  Query: {
    profiles: async (_, { page = 0, limit = 10 }, { models }) => {
      try {
        const userRepository = await getConnection().getRepository(models.User);

        /* Find all users */
        const users = await userRepository.find({ skip: page, take: limit });

        return users;
      } catch (error) {
        return error;
      }
    },

    profile: async (_, { id }, { models }) => {
      try {
        const userRepository = await getConnection().getRepository(models.User);

        /* Find user with id */
        const user = await userRepository.findOne({
          where: { id },
        });

        return user;
      } catch (error) {
        return error;
      }
    },
  },

  Mutation: {
    signUp: async (_, { username, email, password }, { models }) => {
      try {
        if (!emailIsValid(email)) {
          throw new Error('Email is not valid.');
        }

        const userRepository = await getConnection().getRepository(models.User);

        /* Check if user already exists in db */
        const userExists = await userRepository.findOne({
          where: { email },
          select: ['id'],
        });

        if (userExists) {
          throw new Error('User already exists.');
        }

        /* Hash password */
        const hashPassword = await bcrypt.hash(password, 10);

        const user = {
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          password: hashPassword,
        };

        const newUser = await userRepository.save(user);

        return {
          success: true,
          user: newUser,
        };
      } catch (error) {
        return {
          success: false,
          errors: error.message,
        };
      }
    },

    signIn: async (_, { email, password }, { models }) => {
      try {
        if (!emailIsValid(email)) {
          throw new Error('Email is not valid.');
        }

        const userRepository = await getConnection().getRepository(models.User);

        /* Check if user exists */
        const user = await userRepository.findOne({
          where: { email },
        });

        if (!user) {
          throw new Error('No user exist with that email.');
        }

        /* Check if password is correct */
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
          throw new Error('The provided credentials are invalid.');
        }

        const payload = {
          user: {
            id: user.id,
          },
        };

        const token = jwt.sign(payload, process.env.SECRET, {
          expiresIn: '1d',
        });

        return {
          success: true,
          token,
        };
      } catch (error) {
        return {
          success: false,
          errors: error.message,
        };
      }
    },

    recovery: async (_, { email }, { models, url }) => {
      try {
        const userRepository = await getConnection().getRepository(models.User);

        /* Check if user exists */
        const user = await userRepository.findOne({
          where: { email },
        });

        if (!user) {
          throw new Error('No user exist with that email.');
        }

        /* Create reset token */
        const token = crypto.randomBytes(64).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        /* Save token and date to database */
        await userRepository.save(user);

        const body = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Node.js Password Reset',
          text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
              Please click on the following link, or paste this into your browser to complete the process:\n\n
              ${url}/reset/${token}\n\n`,
        };

        /* Send email with token */
        await mailer(body);

        return true;
      } catch (error) {
        return false;
      }
    },

    reset: async (_, { token, password, confirm }, { models }) => {
      try {
        const userRepository = await getConnection().getRepository(models.User);

        /* Check if user exists */
        const user = await userRepository.findOne({
          where: { resetPasswordToken: token, resetPasswordExpires: MoreThan(Date.now()) },
        });

        if (!user) {
          throw new Error('Password reset token is invalid or has expired.');
        }

        /* Check if password match */
        if (password !== confirm) {
          throw new Error('Password did not match.');
        }

        const hashPassword = await bcrypt.hash(password, 10);

        user.password = hashPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await userRepository.save(user);

        const body = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Node.js Password Reset',
          text: `${'Hello,\n\n This is a confirmation that the password for your account '}${
            user.email
          } has just been changed.\n`,
        };

        /* Send email with token */
        await mailer(body);

        return true;
      } catch (error) {
        return false;
      }
    },

    update: checkAuth.createResolver(async (_, { username, email, password }, { models, req }) => {
      try {
        if (email && !emailIsValid(email)) {
          throw new Error('Email is not valid.');
        }

        const userRepository = await getConnection().getRepository(models.User);

        const user = await userRepository.findOne({
          where: { id: req.user.id },
        });

        if (!user) {
          throw new Error('No user exist with that id.');
        }

        user.username = !username ? user.username : username.toLowerCase();
        user.email = !email ? user.email : email.toLowerCase();
        user.password = !password ? user.password : await bcrypt.hash(password, 10);

        /* Save new user to database */
        const updatedUser = await userRepository.save(user);

        return {
          success: true,
          user: updatedUser,
        };
      } catch (error) {
        return {
          success: false,
          errors: error.message,
        };
      }
    }),

    delete: checkAuth.createResolver(async (_, __, { models, req }) => {
      try {
        const userRepository = await getConnection().getRepository(models.User);

        const user = await userRepository.findOne({
          where: { id: req.user.id },
        });

        if (!user) {
          throw new Error('No user exist with that id.');
        }

        await userRepository.remove(user);

        return {
          success: true,
        };
      } catch (error) {
        return {
          success: false,
          errors: error.message,
        };
      }
    }),
  },
};
