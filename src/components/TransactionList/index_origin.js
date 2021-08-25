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
  
      console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')

    }

    async binanceKlines(url) {
      
      console.log('**********',url);
      return await fetch(url).then(res => {
        return res.json()
      }).then(json => {
        return json
      })
    }
    async makeData() {
      var fromBumpdate = new Date(this.props.duration.fromDate);
      
      var fromTimeStamp = fromBumpdate.getTime();
      var from = Number(fromTimeStamp)/1000;
      
      var urlFrom = `${this.binanceHost}/api?module=block&action=getblocknobytime&timestamp=${from}&closest=after&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      console.log('here is from time stamp', urlFrom)
      await fetch(urlFrom)
      .then(res_fb => { return res_fb.json()})
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
     
      await fetch(urlTo)
      .then(res_tb => { return res_tb.json()})
      .then(tb => {

        console.log('MBMNNMNBMVVMNBMN',tb)
        if(tb.message == 'OK')
        this.endBlock = '&endblock='+ tb.result;
        else this.endBlock = '';
        // this.endBlock = '';
      })
      
      console.log('SASDASDADFSFDSDFASDASDA',this.startBlock,'//',this.endBlock)
      var url = `${this.binanceHost}/api?module=account&action=tokentx&address=${this.props.addressStatus}${this.startBlock}${this.endBlock}&page=${this.pageNumber}&offset=70&sort=desc&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^', url)
      var returnValue = await fetch(url)
      .then(res_bkls => {return res_bkls.json()})
      .then(json => { return json ;  });


      return returnValue;
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

    makeTableData(){
      this.makeData().then(bump_bk => {
        var bump_array = [];
        // if(bump_bk.result.length<70) clearInterval(this.state.intervalId);
        bump_bk.result.map(bkl => {
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
        var thisBars = this.bars;
        let table_data = thisBars.map((kl, idx) => {
          
          return {
            time:kl[0],
            hash:kl[7],
            direction:kl[1],
            token:kl[2],
            value:kl[3],
            gas:kl[4],
            gasPrice:kl[5],
            bnbAmount:kl[6],
            no: idx            
          };
        })
        
        this.setState({
          data:table_data
        })
        sessionStorage.setItem('transactionData', JSON.stringify(table_data));
        var transactionData = sessionStorage.getItem('transactionData');
        var individualData = transactionData[1];
        console.log('JJJJJJJJJJJJJJJ',JSON.parse(transactionData));
        console.log('KKKKKKKKKKKKKKK',table_data);

        this.pageNumber = this.pageNumber + 1;
      })
    }

    componentDidMount() {
      console.log('did')
      var intervalId = setInterval(this.makeTableData.bind(this), 1000*3);
      // store intervalId in the state so it can be accessed later:
      this.setState({intervalId: intervalId});
    }
    componentWillMount() {
      this.setState({
        data:this.makeTableData()
      })
      // this.makeTableData();
    }

    componentDidUpdate(prevProps) {
      console.log('update')
      // Typical usage (don't forget to compare props):
      if (this.props.duration !== prevProps.duration) {
        this.pageNumber = 1;
        this.bars=[];
        this.makeTableData();
      }
      if (this.props.addressStatus !== prevProps.addressStatus) {
        this.pageNumber = 1;
        this.bars=[];
        this.makeTableData();
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
                  Header: "No",
                  accessor: "no"
                },
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