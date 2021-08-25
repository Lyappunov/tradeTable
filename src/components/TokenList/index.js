import React,{Component} from 'react';
import { render } from "react-dom";
import { duration, makeStyles } from '@material-ui/core/styles';
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./index.css";
import Price from '../../services/price'
import { throwServerError } from '@apollo/client';


// export default function TransactionList(props) {
  export default class TransactionList extends Component {
    constructor(props){
      super(props)
      this.state = {
        intervalId:null,
        data:[],
        addressStatus:props.addressStatus,
        duration:props.duration
      }
      
      this.pageNumber = 1;
      this.startBlock = '';
      this.endBlock = '';
      this.rcvCmp = false;
      this.bars = [];
      this.binanceHost = 'https://api.bscscan.com'
      this.total_profit = 0;
    }

    getTrProps = (state, rowInfo, instance) => {
      if (rowInfo) {
        return {
          style: {
            color: rowInfo.row.profitTotal > 0 ? 'green' : 'red'
          }
        }
      }
      return {};
    }
    render(){
     var extra_data =  this.props.data;
     var token_array =[];
     
     extra_data.map(array_item => {
        var index = token_array.findIndex(item => item.token == array_item.token);
        var buyTotal = 0;
        var sellTotal = 0;
        
        if(array_item.token!==undefined){
          this.total_profit= this.total_profit + array_item.signal*array_item.bnbAmount;
          if(array_item.signal == 1){
            buyTotal = array_item.bnbAmount;
          }
          else if(array_item.signal == -1){
            sellTotal = array_item.bnbAmount;
          }
          if(index == -1){
          
            let bumpObejct = {
              token:array_item.token,
              tokenAddress:array_item.contractAddress,
              buyTotal:buyTotal,
              sellTotal:sellTotal,
              profitTotal: (buyTotal - sellTotal),
              no:token_array.length+1
            }
            token_array.push(bumpObejct)
          }
          else {
            token_array[index].buyTotal = token_array[index].buyTotal + buyTotal;
            token_array[index].sellTotal = token_array[index].sellTotal + sellTotal;
            token_array[index].profitTotal = token_array[index].profitTotal + (buyTotal - sellTotal);
          }
        }
     })

      return (
          <div style={{width:'100%'}}>
            <div style={{textAlign:'center'}}>
               <span style={{fontSize:28,fontWeight:700,color:'grey'}}>{this.props.addressStatus}</span>
               
            </div>
            {/* <div style={{textAlign:'center'}}> <span style={{fontSize:28,fontWeight:700,color:'grey'}}>{this.props.duration.fromDate + '--' + this.props.duration.toDate}</span></div> */}
            <ReactTable
              data= { token_array }
              columns={[
                {
                  Header: "No",
                  accessor: "no"
                },
                {
                  Header: "Token",
                  accessor: "token",
                  Cell:({row})=><a target="_blank" href={'https://poocoin.app/tokens/'+row.tokenAddress}>{row.token}</a>
                },
                {
                  Header: "Token address",
                  accessor: "tokenAddress",
                  Cell:e=><a target="_blank" href={'https://bscscan.com/token/'+e.value}>{e.value}</a>
                },
                {
                  Header: "BUY Total Amount",
                  accessor: "buyTotal"
                },
                {
                  Header: "SELL Total Amount",
                  accessor: "sellTotal"
                },
                {
                  Header: "Profit Total",
                  accessor: "profitTotal"
                },
                
              ]}
              style={{
                height: "680px", // This will force the table body to overflow and scroll, since there is not enough room
                minWidth: "-webkit-fill-available",
                backgroundColor:"#ffffff"
              }}
              className="-striped -highlight"
              getTrProps={this.getTrProps}
            /> 
          </div>    
      );
    }
}