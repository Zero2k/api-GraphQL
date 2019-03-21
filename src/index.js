import 'dotenv/config';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { makeExecutableSchema } from 'graphql-tools';

import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import db from './utils/db';
import models from './models';
import checkJWT from './utils/jwt';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './graphql/schema')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './graphql/resolvers')));

const createServer = async () => {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const app = express();

  app.use(checkJWT);

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      models,
      url: req ? `${req.protocol}://${req.get('host')}` : '',
      req,
      res,
    }),
  });

  await db();

  apolloServer.applyMiddleware({
    app,
    cors: false,
    path: '/',
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
};

createServer();
