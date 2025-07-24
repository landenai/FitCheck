const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const helmet = require('helmet');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');
const { initializeDatabase } = require('./database');

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://d36ecfc054b2ccb83e7b40ee428531dd@o88872.ingest.us.sentry.io/4508519028686848',
//   integrations: [
//     new Sentry.Integrations.Http({ tracing: true }),
//     new Tracing.Integrations.Express({ app: express }),
//   ],
  tracesSampleRate: 1.0,
});

const app = express();

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize mock database
initializeDatabase();

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Add Sentry transaction to context
      const transaction = Sentry.getCurrentHub().getScope().getTransaction();
      return { transaction };
    },
    plugins: [
      {
        requestDidStart() {
          return {
            willSendResponse({ response, contextValue }) {
              // Add Sentry transaction to response extensions
              if (contextValue?.transaction) {
                response.extensions = response.extensions || {};
                response.extensions.sentryTransactionId = contextValue.transaction.spanId;
              }
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 FitCheck GraphQL Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`📊 Sentry monitoring enabled`);
  });
}

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(`Internal Server Error: ${err.message}`);
});

startApolloServer().catch(console.error); 