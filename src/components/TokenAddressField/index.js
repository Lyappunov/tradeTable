import React, {
    Component,
  } from 'react'

import './index.scss';
import TextField from '@material-ui/core/TextField';

export default class TokenAddressField extends Component {
    constructor(props) {
      super(props);
  
      this.handleSubmit = this.handleSubmit.bind(this);
      this.parentChange = props.setAddressWallet;
      this.parentDurationChange = props.setDurationFromField;
      this.parentDataChange = props.setDataFromField;
      this.parentTotalChange = props.setTotalFromField;
      console.log('********',this.duration);
      this.state = {
        intervalId:null,
        data:[],
        address: props.address,
        duration:props.duration,
        total:0,
        pageNumber:1
      }

      this.startBlock = '';
      this.endBlock = '';
      this.rcvCmp = false;
      this.bars = [];
      this.binanceHost = 'https://api.bscscan.com'


      this.parentChange(this.state.address);
      this.parentDurationChange(this.state.duration);
      this.parentDataChange(this.state.data);
      this.parentTotalChange(this.state.total);
    }

    handleSubmit(event) {
      
      let currentAddress = this.state.address;
      let currentDuration = this.state.duration;
      
      this.parentChange(currentAddress);
      this.parentDurationChange(currentDuration);
      
      
       this.setState({
        data:this.makeTableData()
      })

      event.preventDefault();
    }

    async binanceKlines(url) {

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
      var url = `${this.binanceHost}/api?module=account&action=tokentx&address=${this.props.address}${this.startBlock}${this.endBlock}&page=${this.state.pageNumber}&offset=70&sort=desc&apikey=9XPBG4BA2ZC8CGT939YWE3FU1H6Y6B4618`
      console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^', url)
      var returnValue = await fetch(url)
      .then(res_bkls => {return res_bkls.json()})
      .then(json => { return json ;  });


      return returnValue;
    }

    processing(array) {
      console.log('here is array : ', array)
      var returnArray = [];
      if(array.length>1){
        var input_total = 0;
        var output_total = 0;
        var bnb_total = 0;
        
        returnArray[0] = new Date(array[0].timeStamp * 1000).toISOString();
        returnArray[4] = array[0].gas;
        returnArray[5] = array[0].gasPrice;
        returnArray[7] = array[0].hash;
        var index_buy = array.findIndex(item => item.from == this.props.address && (item.tokenSymbol == 'WBNB' || item.tokenSymbol == 'BUSD'))
        if(index_buy !=-1) {
          returnArray[1] = 'BUY'; 
          returnArray[8] = -1;
        }
        var index_sell = array.findIndex(item => item.to == this.props.address && (item.tokenSymbol == 'WBNB' || item.tokenSymbol == 'BUSD'))
        if(index_sell !=-1) {
          returnArray[1] = 'SELL';
          returnArray[8] = 1;
        }
        array.map(arr => {
          if(returnArray[1] == 'BUY'){
            if(arr.to == this.props.address){
              returnArray[2] = arr.tokenName + ' (' + arr.tokenSymbol + ')';
              returnArray[9] = arr.contractAddress;
              input_total = input_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[3] = input_total;
            }
            if(arr.from == this.props.address){
              if(arr.tokenSymbol == 'WBNB' || arr.tokenSymbol == 'BUSD'){
                bnb_total = bnb_total + Number(arr.value)/10**Number(arr.tokenDecimal);
                returnArray[6] = bnb_total;
              }  
            }
          }
          if(returnArray[1] == 'SELL'){
            if(arr.from == this.props.address){
              returnArray[2] = arr.tokenName + ' (' + arr.tokenSymbol + ')';
              returnArray[9] = arr.contractAddress;
              output_total = output_total + Number(arr.value)/10**Number(arr.tokenDecimal);
              returnArray[3] = output_total;
            }
            if(arr.to == this.props.address){
              if(arr.tokenSymbol == 'WBNB' || arr.tokenSymbol == 'BUSD'){
                bnb_total = bnb_total + Number(arr.value)/10**Number(arr.tokenDecimal);
                returnArray[6] = bnb_total;
              }  
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
        if(bump_bk.result){
          if(bump_bk.result.length<70) {
            this.rcvCmp = true;
          }
          if(bump_bk.result.length>0){

            for (let idx = 0; idx < bump_bk.result.length; idx++) {
              const bkl = bump_bk.result[idx];
         
            // bump_bk.result.map(bkl => {
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
            }
          }
        }
        var thisBars = this.bars;
        var totalProfit = 0;
        let table_data = thisBars.map((kl, idx) => {
          if(kl[2] != undefined){
            totalProfit = totalProfit + kl[6];
          }
            return {
              time:kl[0],
              hash:kl[7],
              direction:kl[1],
              token:kl[2],
              value:kl[3],
              gas:kl[4],
              gasPrice:kl[5],
              bnbAmount:kl[6],
              signal:kl[8],
              contractAddress:kl[9],
              no: idx+1            
            };
          
        })
        
        this.setState({
          data:table_data
        })
        this.parentDataChange(table_data);
        this.parentTotalChange(totalProfit);
        sessionStorage.setItem('transactionData', JSON.stringify(table_data));

        var nextPage = this.state.pageNumber + 1;
        this.setState({pageNumber:nextPage})
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
    }

    componentDidUpdate(prevProps) {
      console.log('update')
      // Typical usage (don't forget to compare props):
      if (this.props.duration !== prevProps.duration) {
        this.setState({pageNumber:1})
        this.bars=[];
        this.makeTableData();
      }
      if (this.props.address !== prevProps.address) {
        this.setState({pageNumber:1})
        this.bars=[];
        this.makeTableData();
      }
    }

  
    render() {
            
      return (
        <form onSubmit={this.handleSubmit}>
          <div className="row form-container">
            <div className="col-md-4">
              <div className="row">
                <div className="col-md-4 label-div" style={{textAlign:"right"}}>
                  <label>Token Address: </label>
                </div>
                <div className="col-md-8">
                  <TextField id="outlined-basic" 
                    onChange={event => {
                      // const { value } = event.target.value;
                      this.setState({ 
                        address: event.target.value,
                        duration:{
                          fromDate:this.state.duration.fromDate,
                          toDate:this.state.duration.toDate
                        }
                      });
                      console.log(event.target.value);
                    }} 
                    onKeyUp={event => {
                      if (event.key== 'Enter'){
                        this.handleSubmit()
                      }
                    }} 
                    label="Address" variant="outlined" 
                    size = "small"
                  />
                </div>
                
              </div>
            </div>
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-6">
                  <TextField
                    id="from-date"
                    label="From"
                    type="datetime-local"
                    variant="outlined"
                    defaultValue={this.state.duration.fromDate}
                    onChange={event => {
                      this.setState({ 
                        address: this.state.address,
                        duration:{
                          fromDate:event.target.value,
                          toDate:this.state.duration.toDate
                        }
                      });
                      console.log(event.target.value);
                    }} 
                  />
                </div>
                <div className="col-md-6">
                  <TextField
                    id="to-date"
                    label="To"
                    type="datetime-local"
                    variant="outlined"
                    defaultValue={this.state.duration.toDate}
                    onChange={event => {
                      this.setState({ 
                        address: this.state.address,
                        duration:{
                          fromDate:this.state.duration.fromDate,
                          toDate:event.target.value
                        }
                      });
                      console.log(event.target.value);
                    }} 
                  />
                </div>
              </div>
                
            </div>
            <div className="col-md-2">
              <input type="submit" value="View" />
            </div>
          </div>  
        </form>
      );
    }
  }
  