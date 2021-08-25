import React from 'react';
import ReactDOM from 'react-dom';
import App from './pages/Home';
import './assets/scss/global.scss';
import reportWebVitals from './reportWebVitals';
import {ApolloClient, HttpLink, InMemoryCache, ApolloProvider} from "@apollo/client"

const client = new ApolloClient({
  link: new HttpLink({
    header:"Access-Control-Allow-Origin : localhost:3000",
    uri: "https://graphql.bitquery.io"
  }),
  cache: new InMemoryCache()
})

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App/>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
