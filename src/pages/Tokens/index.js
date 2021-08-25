import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.css";
import './index.scss'
import '../index.css'

import TokenList from '../../components/TokenList'

import {options} from '../../global/tv';


function Tokens(props){
  const [totalSupply, setTotalSupply] = useState(0)
  const [circulationSupply, setCirculationSupply] = useState(0)
  const [marketCap, setMarketCap] = useState(0);
  const [tokenInfo, setTokenInfo] = useState({});
  const [BNBPrice, setBNBPrice] = useState(0);
  const [completeFlg, setComponentFlg] = useState(false);
  const [addressStatus, setAddressStatus] = useState('0xa6364afb914792fe81e0810d5f471be172079f7b');
  const setComplete = () => {
    setComponentFlg(true)
  }
  const setNecessaryState = ()=>{
    if(completeFlg == true){
      
      totalSupplyMethod().then(tsr=>{
        setTotalSupply((tsr/Math.pow(10,9)))
      })
      circulationSupplies().then(cs=>{
        setCirculationSupply((cs/Math.pow(10,9)))
      })
      getTokenInfo().then(ti=>{
        setTokenInfo(ti)
      })
      getBNBPrice().then(bp=>{
        setBNBPrice(bp.result.ethusd)
      })
    }
  }

  
  
    return (

        <div className="container" style={{ minWidth:'100%',backgroundColor:'whie' }}>
          
          <div className="row">
            
            <div className="col-md-10" style={{ margin:'auto' }}>
              <div style={{fontSize:26, fontWeight:600, color:"grey"}}>
                Wallet total for each token
                <span style={{float:'right',marginRight:'7%',fontSize:22,fontWeight:600,color:props.totalProfit>0?'green':'red'}}>{props.totalProfit}</span>
                </div>
              <div className="trading-chart" style={{ backgroundColor:'white', width:'100%', maxHeight:680, marginTop:20}}>
                <TokenList addressStatus={props.addressStatus} duration={props.duration} data={props.tableData} setTotalFromField={props.setTotalFromField}/>
              </div>
            </div>
            
          </div>
            
        </div>

    )
  
}

export default Tokens;