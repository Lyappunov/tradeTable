
import React, { useState, useEffect } from 'react';
import { render } from "react-dom";
import { duration, makeStyles } from '@material-ui/core/styles';
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./index.css";
import Price from '../../services/price'


// export default function TransactionList(props) {
  export default function TransactionList(props) {
    
      const [pageNumber, setPageNumber] = useState(1);
      const [data, setData] = useState([]);
      const [address, setAddress] = useState(props.addressStatus);
      const [duration, setDuration] = useState(props.duration);
 
      var startBlock = '';
      var endBlock = '';
      var bars = [];
      const binanceHost = 'https://api.bscscan.com';
      var interval = null;
    
      console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq ',pageNumber)
      // this.price = new Price({setPriceMethod:setPrice})
      // this.price.getPrice()
    
    // useEffect(() => {
    //   setDuration(props.duration);
    //   setAddress(props.addressStatus);
    //   console.log('@@@@@@@@@@@@@@',duration)
    // }, [])

    const getFromBlock = async() => {
      var fromBumpdate = new Date(duration.fromDate);
      
      var fromTimeStamp = fromBumpdate.getTime();
      var from = Number(fromTimeStamp)/1000;
      
      const url = `${binanceHost}/api?module=block&action=getblocknobytime&timestamp=${from}&closest=after&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      console.log('???????????',fromBumpdate,'//', fromTimeStamp,'//',url)
      return await fetch(url).then(res => {
        return res.json()
      }).then(json => {
        return json
      })
    }

    const getToBlock = async () => {
      var toBumpdate = new Date(duration.toDate);
      var toTimeStamp = toBumpdate.getTime();
      var to = Number(toTimeStamp)/1000;
      
      const url = `${binanceHost}/api?module=block&action=getblocknobytime&timestamp=${to}&closest=before&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      console.log('^^^^^^^^^^^',toBumpdate,'//', toTimeStamp,'//',url);
      return await fetch(url).then(res => {
        return res.json()
      }).then(json => {
        return json
      })
    }

    const binanceKlines = async(url) => {

      console.log('##############',url)
      return await fetch(url).then(res => {
        return res.json()
      }).then(json => {
        return json
      })
    }

    const makeData = () => {
      getFromBlock().then(fb => {
        if(fb.message == 'OK')
        startBlock = '&startblock='+ fb.result;
        else startBlock = '';
      });
      getToBlock().then(tb => {
        if(tb.message == 'OK')
        endBlock = '&endblock='+ tb.result;
        else endBlock = '';
      });
      var url = `${binanceHost}/api?module=account&action=tokentx&address=${address}${startBlock}${endBlock}&page=${pageNumber}&offset=70&sort=desc&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      binanceKlines(url).then(bkls => {
        var thisBars = [];
        var bump_array = [];
        if(bkls.result.length<70) clearInterval(interval);
        bkls.result.map(bkl => {
            if(bump_array.length<=0) bump_array.push(bkl)
            else {
              var index = bump_array.findIndex(function(item, idx) {
                if(item.hash == bkl.hash)
                    return true;
              });

              if(index != -1) bump_array.push(bkl) 
              else {
                
                  var rowDataBumpArray = processing(bump_array);
                  if(rowDataBumpArray.length>0) bars.push(rowDataBumpArray);
                  bump_array = [];
                  bump_array.push(bkl);
                
              }
            }
            
 
        //this.bar[0]=date, this.bar[1]=direction(buy or sell), this.bar[2]=tokenName and tokenSymbol,
        //this.bar[3]=value, this.bar[4]=gas, this.bar[5]=gasPrice, this.bar[6]=wbnb
        })


        let table_data = bars.map(kl => {
          
          return {
            time:kl[0],
            hash:kl[7],
            direction:kl[1],
            token:kl[2],
            value:kl[3],
            gas:kl[4],
            gasPrice:kl[5],
            bnbAmount:kl[6]            
          };
        })
        console.log('TTTTTTTTTTTT',table_data)
        return table_data;
      })

    }

    const processing = (array) => {
      var returnArray = [];
      if(array.length>1){
        var input_total = 0;
        var output_total = 0;
        var bnb_total = 0;
        
        returnArray[0] = new Date(array[0].timeStamp * 1000).toISOString();
        returnArray[4] = array[0].gas;
        returnArray[5] = array[0].gasPrice;
        returnArray[7] = array[0].hash;
        var index_buy = array.findIndex(item => item.from == props.addressStatus && item.tokenSymbol == 'WBNB')
        if(index_buy !=-1) returnArray[1] = 'BUY';
        var index_sell = array.findIndex(item => item.to == props.addressStatus && item.tokenSymbol == 'WBNB')
        if(index_sell !=-1) returnArray[1] = 'SELL';
        array.map(arr => {
          if(returnArray[1] == 'BUY'){
            if(arr.to == props.addressStatus){
              returnArray[2] = arr.tokenName + ' (' + arr.tokenSymbol + ')';
              input_total = input_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[3] = input_total;
            }
            if(arr.from == props.addressStatus){
              bnb_total = bnb_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[6] = bnb_total;
            }
          }
          if(returnArray[1] == 'SELL'){
            if(arr.from == props.addressStatus){
              returnArray[2] = arr.tokenName + ' (' + arr.tokenSymbol + ')';
              output_total = output_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[3] = output_total;
            }
            if(arr.to == props.addressStatus){
              bnb_total = bnb_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[6] = bnb_total;
            }
          }
          
        })

        return returnArray;
      }
      return returnArray;
    }

    
    useEffect(() => {
      setDuration(props.duration);
      setAddress(props.addressStatus);
      interval = setInterval(() => {
        setPageNumber(pageNumber=> pageNumber + 1);
        
        var bumpData = makeData();
        console.log('HHHHHHHHHHH',bumpData);
        setData(bumpData); 

      }, 3000);
      return () => clearInterval(interval);
    }, []);

    const getTrProps = (state, rowInfo, instance) => {
        if (rowInfo) {
        return {
            style: {
            color: rowInfo.row.direction == 'BUY' ? 'green' : 'red'
            }
        }
        }
        return {};
    }

    console.log('$$$$$$$$$$$$', data)
      // let { tableData } = data;
      return (
         
            <ReactTable
              data= {data}
              columns={[
                {
                  Header: "Date and Time",
                  accessor: "time"
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
              getTrProps={getTrProps}
            /> 
       
      );
    
}



/////////////////////////////////////////////////////////////////////


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
        data:null,
        addressStatus:props.addressStatus,
        duration:props.duration
      }
      
      this.pageNumber = 1;
      this.startBlock = '';
      this.endBlock = '';
      this.rcvCmp = false;
      this.bars = [];
      this.binanceHost = 'https://api.bscscan.com'
      function setPrice(value){
        callbackAction(value)
      }
      console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')
      // this.price = new Price({setPriceMethod:setPrice})
      // this.price.getPrice()
    }

    // async getFromBlock() {
    //   var fromBumpdate = new Date(this.props.duration.fromDate);
      
    //   var fromTimeStamp = fromBumpdate.getTime();
    //   var from = Number(fromTimeStamp)/1000;
      
    //   const url = `${this.binanceHost}/api?module=block&action=getblocknobytime&timestamp=${from}&closest=after&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
    //   console.log('here is from time stamp', url)
    //   return await fetch(url).then(res => {
    //     return res.json()
    //   }).then(json => {
    //     return json
    //   })
    // }

    // async getToBlock() {
    //   var toBumpdate = new Date(this.props.duration.toDate);
    //   var toTimeStamp = toBumpdate.getTime()
    //   var to = Number(toTimeStamp)/1000;

    //   const url = `${this.binanceHost}/api?module=block&action=getblocknobytime&timestamp=${to}&closest=before&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
    //   console.log('here is to time stamp', url)
    //   return await fetch(url).then(res => {
    //     return res.json()
    //   }).then(json => {
    //     return json
    //   })
    // }

    async binanceKlines(url) {
      
      console.log('**********',url);
      return await fetch(url).then(res => {
        return res.json()
      }).then(json => {
        return json
      })
    }
    makeData() {
      var fromBumpdate = new Date(this.props.duration.fromDate);
      
      var fromTimeStamp = fromBumpdate.getTime();
      var from = Number(fromTimeStamp)/1000;
      
      var urlFrom = `${this.binanceHost}/api?module=block&action=getblocknobytime&timestamp=${from}&closest=after&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      console.log('here is from time stamp', urlFrom)
      fetch(url)
      .then(res_fb => res_fb.json())
      .then(fb => {
        
        console.log('HKLHJHJKLJKLHKLJ:LKJ',fb)
        if(fb.message == 'OK')
        this.startBlock = '&startblock='+ fb.result;
        else this.startBlock = '';
        //  this.startBlock = '';
      })

     
      var toBumpdate = new Date(this.props.duration.toDate);
      var toTimeStamp = toBumpdate.getTime()
      var to = Number(toTimeStamp)/1000;

      var urlTo = `${this.binanceHost}/api?module=block&action=getblocknobytime&timestamp=${to}&closest=before&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      console.log('here is to time stamp', urlTo)
     
      fetch(url)
      .then(res_tb => res_tb.json())
      .then(tb => {

        console.log('MBMNNMNBMVVMNBMN',tb)
        if(tb.message == 'OK')
        this.endBlock = '&endblock='+ tb.result;
        else this.endBlock = '';
        // this.endBlock = '';
      })
      

      var url = `${this.binanceHost}/api?module=account&action=tokentx&address=${this.props.addressStatus}${this.startBlock}${this.endBlock}&page=${this.pageNumber}&offset=70&sort=desc&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^', url)
      fetch(url)
      .then(res_bkls => {return res_bkls.json()})
      // .then( json_bkls => { return json_bkls})
      .then(bkls =>{

      // const bkls = await res_bkls.json();
        var thisBars = [];
        var bump_array = [];
        if(bkls.result.length<70) clearInterval(this.state.intervalId);
        bkls.result.map(bkl => {
            if(bump_array.length<=0) bump_array.push(bkl)
            else {
              var index = bump_array.findIndex(function(item, idx) {
                if(item.hash == bkl.hash)
                    return true;
              });

              if(index != -1) bump_array.push(bkl) 
              else {
                
                  var rowDataBumpArray = this.processing(bump_array);
                  if(rowDataBumpArray.length>0) this.bars.push(rowDataBumpArray);
                  bump_array = [];
                  bump_array.push(bkl);
                
              }
            }
            
 
        //this.bar[0]=date, this.bar[1]=direction(buy or sell), this.bar[2]=tokenName and tokenSymbol,
        //this.bar[3]=value, this.bar[4]=gas, this.bar[5]=gasPrice, this.bar[6]=wbnb
        })


        let table_data = this.bars.map(kl => {
          
          return {
            time:kl[0],
            hash:kl[7],
            direction:kl[1],
            token:kl[2],
            value:kl[3],
            gas:kl[4],
            gasPrice:kl[5],
            bnbAmount:kl[6]            
          };
        })
       
        this.setState({
          data:table_data
        })
        this.pageNumber = this.pageNumber + 1;
      });

    }

    processing(array) {
      var returnArray = [];
      if(array.length>1){
        var input_total = 0;
        var output_total = 0;
        var bnb_total = 0;
        
        returnArray[0] = new Date(array[0].timeStamp * 1000).toISOString();
        returnArray[4] = array[0].gas;
        returnArray[5] = array[0].gasPrice;
        returnArray[7] = array[0].hash;
        var index_buy = array.findIndex(item => item.from == this.props.addressStatus && item.tokenSymbol == 'WBNB')
        if(index_buy !=-1) returnArray[1] = 'BUY';
        var index_sell = array.findIndex(item => item.to == this.props.addressStatus && item.tokenSymbol == 'WBNB')
        if(index_sell !=-1) returnArray[1] = 'SELL';
        array.map(arr => {
          if(returnArray[1] == 'BUY'){
            if(arr.to == this.props.addressStatus){
              returnArray[2] = arr.tokenName + ' (' + arr.tokenSymbol + ')';
              input_total = input_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[3] = input_total;
            }
            if(arr.from == this.props.addressStatus){
              bnb_total = bnb_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[6] = bnb_total;
            }
          }
          if(returnArray[1] == 'SELL'){
            if(arr.from == this.props.addressStatus){
              returnArray[2] = arr.tokenName + ' (' + arr.tokenSymbol + ')';
              output_total = output_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[3] = output_total;
            }
            if(arr.to == this.props.addressStatus){
              bnb_total = bnb_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[6] = bnb_total;
            }
          }
          
        })

        return returnArray;
      }
      return returnArray;
    }

    componentDidMount() {
      console.log('did')
      var intervalId = setInterval(this.makeData.bind(this), 1000*3);
      // store intervalId in the state so it can be accessed later:
      this.setState({intervalId: intervalId});
    }
    componentWillMount() {
     console.log('will')
      this.setState({
        data:this.makeData()
      })
    
    }

    componentDidUpdate(prevProps) {
      console.log('update')
      // Typical usage (don't forget to compare props):
      if (this.props.duration !== prevProps.duration) {
        this.pageNumber = 1;
        this.bars=[];
        this.makeData();
      }
      if (this.props.addressStatus !== prevProps.addressStatus) {
        this.pageNumber = 1;
        this.bars=[];
        this.makeData();
      }
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
          <div style={{width:'100%'}}>
            <div style={{textAlign:'center'}}> <span style={{fontSize:28,fontWeight:700,color:'grey'}}>{this.props.addressStatus}</span></div>
            <div style={{textAlign:'center'}}> <span style={{fontSize:28,fontWeight:700,color:'grey'}}>{this.props.duration.fromDate + '--' + this.props.duration.toDate}</span></div>
            <ReactTable
              data= { data }
              columns={[
                {
                  Header: "Date and Time",
                  accessor: "time"
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        data:null,
        addressStatus:props.addressStatus,
        duration:props.duration
      }
      
      this.pageNumber = 1;
      this.startBlock = '';
      this.endBlock = '';
      this.rcvCmp = false;
      this.bars = [];
      this.binanceHost = 'https://api.bscscan.com'
      function setPrice(value){
        callbackAction(value)
      }
      console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')
      // this.price = new Price({setPriceMethod:setPrice})
      // this.price.getPrice()
    }

    async getFromBlock() {
      var fromBumpdate = new Date(this.props.duration.fromDate);
      
      var fromTimeStamp = fromBumpdate.getTime();
      var from = Number(fromTimeStamp)/1000;
      
      const url = `${this.binanceHost}/api?module=block&action=getblocknobytime&timestamp=${from}&closest=after&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      console.log('here is from time stamp', url)
      return await fetch(url).then(res => {
        return res.json()
      }).then(json => {
        return json
      })
    }

    async getToBlock() {
      var toBumpdate = new Date(this.props.duration.toDate);
      var toTimeStamp = toBumpdate.getTime()
      var to = Number(toTimeStamp)/1000;

      const url = `${this.binanceHost}/api?module=block&action=getblocknobytime&timestamp=${to}&closest=before&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      console.log('here is to time stamp', url)
      return await fetch(url).then(res => {
        return res.json()
      }).then(json => {
        console.log('RUYRYUTYTYUREUUYRUY',json)
        return json
      })
    }

    async binanceKlines(url) {
      
      console.log('**********',url);
      return await fetch(url).then(res => {
        return res.json()
      }).then(json => {
        return json
      })
    }
    makeData() {
      this.getFromBlock().then(fb => {
        
        if(fb.message == 'OK')
        this.startBlock = '&startblock='+ fb.result;
        else this.startBlock = '';
        console.log('here is FB', this.startBlock)
      });
      this.getToBlock().then(tb => {
        
        if(tb.message == 'OK')
        this.endBlock = '&endblock='+ tb.result;
        else this.endBlock = '';
        console.log('here is TB', this.endBlock)
      });

      var url = `${this.binanceHost}/api?module=account&action=tokentx&address=${this.props.addressStatus}${this.startBlock}${this.endBlock}&page=${this.pageNumber}&offset=70&sort=desc&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      
      this.binanceKlines(url).then(bkls => {
        var thisBars = [];
        var bump_array = [];
        if(bkls.result.length<70) clearInterval(this.state.intervalId);
        bkls.result.map(bkl => {
            if(bump_array.length<=0) bump_array.push(bkl)
            else {
              var index = bump_array.findIndex(function(item, idx) {
                if(item.hash == bkl.hash)
                    return true;
              });

              if(index != -1) bump_array.push(bkl) 
              else {
                
                  var rowDataBumpArray = this.processing(bump_array);
                  if(rowDataBumpArray.length>0) this.bars.push(rowDataBumpArray);
                  bump_array = [];
                  bump_array.push(bkl);
                
              }
            }
            
 
        //this.bar[0]=date, this.bar[1]=direction(buy or sell), this.bar[2]=tokenName and tokenSymbol,
        //this.bar[3]=value, this.bar[4]=gas, this.bar[5]=gasPrice, this.bar[6]=wbnb
        })


        let table_data = this.bars.map(kl => {
          
          return {
            time:kl[0],
            hash:kl[7],
            direction:kl[1],
            token:kl[2],
            value:kl[3],
            gas:kl[4],
            gasPrice:kl[5],
            bnbAmount:kl[6]            
          };
        })
       
        this.setState({
          data:table_data
        })
        this.pageNumber = this.pageNumber + 1;
      })

    }

    processing(array) {
      var returnArray = [];
      if(array.length>1){
        var input_total = 0;
        var output_total = 0;
        var bnb_total = 0;
        
        returnArray[0] = new Date(array[0].timeStamp * 1000).toISOString();
        returnArray[4] = array[0].gas;
        returnArray[5] = array[0].gasPrice;
        returnArray[7] = array[0].hash;
        var index_buy = array.findIndex(item => item.from == this.props.addressStatus && item.tokenSymbol == 'WBNB')
        if(index_buy !=-1) returnArray[1] = 'BUY';
        var index_sell = array.findIndex(item => item.to == this.props.addressStatus && item.tokenSymbol == 'WBNB')
        if(index_sell !=-1) returnArray[1] = 'SELL';
        array.map(arr => {
          if(returnArray[1] == 'BUY'){
            if(arr.to == this.props.addressStatus){
              returnArray[2] = arr.tokenName + ' (' + arr.tokenSymbol + ')';
              input_total = input_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[3] = input_total;
            }
            if(arr.from == this.props.addressStatus){
              bnb_total = bnb_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[6] = bnb_total;
            }
          }
          if(returnArray[1] == 'SELL'){
            if(arr.from == this.props.addressStatus){
              returnArray[2] = arr.tokenName + ' (' + arr.tokenSymbol + ')';
              output_total = output_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[3] = output_total;
            }
            if(arr.to == this.props.addressStatus){
              bnb_total = bnb_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[6] = bnb_total;
            }
          }
          
        })

        return returnArray;
      }
      return returnArray;
    }

    componentDidMount() {
      
      var intervalId = setInterval(this.makeData.bind(this), 1000*3);
      // store intervalId in the state so it can be accessed later:
      this.setState({intervalId: intervalId});
      // clearInterval(this.state.intervalId);
    }
    componentWillMount() {
     
      this.setState({
        data:this.makeData()
      })
    
    }

    componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):
      if (this.props.duration !== prevProps.duration) {
        this.pageNumber = 1;
        this.bars=[];
        this.makeData();
      }
      if (this.props.addressStatus !== prevProps.addressStatus) {
        this.pageNumber = 1;
        this.bars=[];
        this.makeData();
      }
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
          <div style={{width:'100%'}}>
            <div style={{textAlign:'center'}}> <span style={{fontSize:28,fontWeight:700,color:'grey'}}>{this.props.addressStatus}</span></div>
            <div style={{textAlign:'center'}}> <span style={{fontSize:28,fontWeight:700,color:'grey'}}>{this.props.duration.fromDate + '--' + this.props.duration.toDate}</span></div>
            <ReactTable
              data= { data }
              columns={[
                {
                  Header: "Date and Time",
                  accessor: "time"
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

