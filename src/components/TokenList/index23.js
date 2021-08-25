import React,{Component} from 'react';
import { render } from "react-dom";
import { makeStyles } from '@material-ui/core/styles';
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./index.css";
import Price from '../../services/price'

import { dateRangeGlobal } from "../../pages/Home"

// export default function TransactionList(props) {
  export default class TransactionList extends Component {
    constructor(props){
      super()
      const {callbackAction} = props
      this.dateTableRange = dateRangeGlobal
      this.state = {
        intervalId:null,
        data:null
      }
      this.busdArray = [];
      this.orfanoArray = [];

      function setPrice(value){
        callbackAction(value)
      }

      // this.price = new Price({setPriceMethod:setPrice})
      // this.price.getPrice()
    }

    async loadTableData(startTime, endTime) {
      const toJSON = JSON.stringify;
      const query = `
      {
        ethereum(network: bsc) {
          dexTrades(
            options: {desc: "timeInterval.minute", limit: 1000}
            exchangeName: {is: "Pancake"}
            time: {since: ${toJSON(toISODateTime(startTime))}, till: ${toJSON(toISODateTime(endTime))}}
            baseCurrency: {in: ["0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"]}
            quoteCurrency: {in: ["${sessionStorage.getItem('state')}","0xe9e7cea3dedca5984780bafc599bd69add087d56"]}
          ) {
            timeInterval {
              minute(count: 15)
            }
            exchange {
              name
            }
            
            baseCurrency {
              address
              symbol
            }
            quoteCurrency { 
              address
              symbol
            }
            baseAmount
            quoteAmount
            USD: tradeAmount(in: USD, calculate: sum)
            Txs: count
            maximum_price: quotePrice(calculate: maximum)
            minimum_price: quotePrice(calculate: minimum)
            open_price: minimum(of: block, get: quote_price)
            close_price: maximum(of: block, get: quote_price)
            side
          }
        }
      }`;
      const res = await fetch('https://graphql.bitquery.io', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json; charset=utf-8',
          'X-API-KEY': 'BQYvhnv04csZHaprIBZNwtpRiDIwEIW9',
        }),
        body: JSON.stringify({ query }),
        mode: 'cors',
      });
      return await res.json();
     
      function toISODateTime(t) {
        return new Date(t).toISOString();
      }
    
      function toISODate(t) {
        return toISODateTime(t).split('T')[0];
      }
    }

    makeData() {
      
      this.loadTableData(...this.dateTableRange).then(klines => {
        this.busdArray = [];
        this.orfanoArray = [];  
          klines.data.ethereum.dexTrades.map(tkl => {
              if(tkl.quoteCurrency.symbol === "ORFANO"){
                  this.orfanoArray.push(tkl)
              } else if(tkl.quoteCurrency.symbol === "BUSD"){
                  this.busdArray.push(tkl)
              }
          })
      });
        let data = this.orfanoArray.map((kl, index) => {
          
          var datetime = new Date(kl.timeInterval.minute)

          var orfanoValue_close = parseFloat(kl.close_price)

          var closeValue = (parseFloat(this.busdArray[index].close_price)/orfanoValue_close*(1-0.0644)).toFixed(12)
          
          return {
            direction:kl.side,
            token:kl.quoteAmount,
            price:Number.parseFloat((closeValue*kl.quoteAmount)).toFixed(12),
            price_token:Number.parseFloat((closeValue)).toFixed(12),
            time:kl.timeInterval.minute
          };
        });
        this.setState({
          data:data
        })
      
    }

    componentDidMount() {
      var intervalId = setInterval(this.makeData.bind(this), 1000*3);
      // store intervalId in the state so it can be accessed later:
      this.setState({intervalId: intervalId});
   }
    componentWillMount() {
      this.setState({
        data:this.makeData()
      })
       clearInterval(this.state.intervalId);
    }

    getTrProps = (state, rowInfo, instance) => {
    if (rowInfo) {
      return {
        style: {
          color: rowInfo.row.direction == 'BUY' ? 'green' : 'red'
        }
      }
    }
    return {};
  }
    render(){
      const { data } = this.state;
      return (
          // <div>sdf</div>
            <ReactTable
              data= { data }
              columns={[
                {
                  Header: "Sell / Buy",
                  accessor: "direction"
                },
                {
                  Header: "Token",
                  accessor: "token"
                },
                {
                  Header: "Price",
                  accessor: "price"
                },
                {
                  Header: "Price/Token",
                  accessor: "price_token"
                },
                {
                  Header: "Time",
                  accessor: "time"
                },
              ]}
              style={{
                height: "400px", // This will force the table body to overflow and scroll, since there is not enough room
                minWidth: "-webkit-fill-available",
                backgroundColor:"#131722"
              }}
              className="-striped -highlight"
              getTrProps={this.getTrProps}
            /> 
              
      );
    }
}
