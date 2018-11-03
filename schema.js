const fetch = require("node-fetch");
const util = require("util");
const parseXML = util.promisify(require('xml2js').parseString);

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} = require("graphql")

const key = "PlzRig5nleiS3XvYNYYPfA"

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "...",

  fields: () => ({
    title: {
      type: GraphQLString,
      //book data being fetched in AuthorType by id
      resolve: xml => xml.GoodreadsResponse.book[0].title[0]
        // xml.title[0]

    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve: xml => {
        const authorElements = xml.GoodreadsResponse.book[0].authors[0].author;
        const ids = authorElements.map(elem => elem.id[0]);
        return Promise.all(ids.map(id =>
        fetch(`https://www.goodreads.com/author/list/${id}?format=xml&key=PlzRig5nleiS3XvYNYYPfA`)
          .then(response => response.text())
          .then(parseXML)))
      }
    }
  })
})

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "...",

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml =>
        xml.GoodreadsResponse.author[0].name[0]
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: xml => {
        //xml.GoodreadsResponse.author[0].books[0].book

        //Save id from fetch -- underscore is result of dealing with XML to JS weirdness
        const ids = xml.GoodreadsResponse.author[0].books[0].book.map(elem => elem.id[0]._)
        //fetch for each id from books end point
        console.log("IDS:", ids)
        console.log("currently fetching books...")
        return Promise.all(ids.map(id => fetch(`https://www.goodreads.com/book/show/${id}.xml?key=PlzRig5nleiS3XvYNYYPfA`)
        .then(response => response.text())
        .then(parseXML)
      ))
      //result passed into each BookType


      }




    }
  })
})

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    description: "...",

    fields: () => ({
      author: {
        type: AuthorType,
        args: {
          id: { type: GraphQLInt },
        },
        resolve: (root, args) => fetch(
          `https://www.goodreads.com/author/list/${args.id}?format=xml&key=PlzRig5nleiS3XvYNYYPfA`
        )
          .then(response => response.text())
          .then(parseXML)
      }
    })
  })
})
