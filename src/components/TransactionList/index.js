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
      
    }

    getTrProps = (state, rowInfo, instance) => {
      if (rowInfo) {
        return {
          style: {
            color: rowInfo.row.direction == 'BUY' ? 'green' : 'red'
          },      
        }
      }
      return {};
    }
    render(){
     
      return (
          <div style={{width:'100%'}}>
            <div style={{textAlign:'center'}}> <span style={{fontSize:28,fontWeight:700,color:'grey'}}>{this.props.addressStatus}</span></div>
            {/* <div style={{textAlign:'center'}}> <span style={{fontSize:28,fontWeight:700,color:'grey'}}>{this.props.duration.fromDate + '--' + this.props.duration.toDate}</span></div> */}
            <ReactTable
              data= { this.props.data }
              columns={[
                {
                  Header: "No",
                  accessor: "no"
                },
                {
                  Header: "Date and Time",
                  accessor: "time"
                },
                {
                  Header: "Txn Hash",
                  accessor: "hash",
                  Cell:e=><a target="_blank" href={'https://bscscan.com/tx/'+e.value}>{e.value}</a>
                },
                {
                  Header: "BUY/SELL",
                  accessor: "direction"
                },
                {
                  Header: "Token",
                  accessor: "token"
                },
                {
                  Header: "Value",
                  accessor: "value"
                },
                {
                  Header: "Gas",
                  accessor: "gas"
                },
                {
                  Header: "Gas Price",
                  accessor: "gasPrice"
                },
                
                {
                  Header: "WBNB Amount",
                  accessor: "bnbAmount"
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