const fetch = require('node-fetch');
const util = require('util');
const parseXML = util.promisify(require('xml2js').parseString)
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} = require('graphql')

function translate(lang, str) {
  // Google Translate API is a paid (but dirt cheap) service. This is my key
  // and will be disabled by the time the video is out. To generate your own,
  // go here: https://cloud.google.com/translate/v2/getting_started
  const apiKey = 'knZ6B8asC5WpDpmpfb26IQ';
  const url = 'https://www.googleapis.com' + '/language/translate/v2' + '?key=' + apiKey + '&source=en' + '&target=' + lang + '&q=' + encodeURIComponent(str);
  return fetch(url)
  .then(response => response.json())
  .then(parsedResponse => parsedResponse.data.translations[0].translatedText)
}

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: '...',

  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: xml =>
      xml.title[0]
    },
    isbn: {
      type: GraphQLString,
      resolve: xml => xml.isbn[0]
    }
  })
})

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: '...',

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml =>
        xml.GoodreadsResponse.author[0].name[0]
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: xml =>
        xml.GoodreadsResponse.author[0].books[0].book
    }
  })
})

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',

    fields: () => ({
      author: {
        type: AuthorType,
        args: {
          id: { type: GraphQLInt }
        },
        resolve: (root, args) => fetch(`https://www.goodreads.com/author/show.xml?id=${args.id}&key=knZ6B8asC5WpDpmpfb26IQ`)
        .then(response => response.text())
        .then(parseXML)
      }
    })
  })
})
