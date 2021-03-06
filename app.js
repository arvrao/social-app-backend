// imports
const dotenv = require('dotenv');
const {
  app,
  mongoose,
  vars,
  emailApp
} = require("./src/config");
const requireLogin = require('./src/middlewares/requireLogin')
const uploadMedia = require('./src/routes/media')
const users = require('./src/routes/user.route')
const auth = require('./src/routes/auth')
const post = require('./src/routes/post')

dotenv.config()

//* database connection
mongoose.connect();

//* Middlewares
app.use('/api', auth)
app.use('/posts', post)
app.use('/upload', requireLogin, uploadMedia)
app.use('/users', users)

// Start the server
app.listen(vars.port, () => {
  console.log(`Server running at port ${vars.port}`);
})

// start email server
emailApp.listen(vars.emailConfig.port, () =>
  console.log(`Mailing Server started on port ${vars.emailConfig.port}`)
);

//! Handle unexpected errors
process
  .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
    process.exit(1);
  })
  .on("uncaughtException", (err) => {
    console.error(err, "Uncaught Exception thrown");
    process.exit(1);
  });