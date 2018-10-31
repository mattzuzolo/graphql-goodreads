const express = require("express");
const graphqlHTTP = require('express-graphql');
const app = express();

const schema = require("./schema");

const PORT = 4000;

app.use("/graphql", graphqlHTTP({
    schema,
    graphiql: true,
}));

app.listen(PORT, () => {
    console.log(`Started on port ${PORT}.`);
})