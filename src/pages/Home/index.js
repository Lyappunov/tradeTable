import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.css";
import './index.scss';
import '../index.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch
} from "react-router-dom";

import TokenAddressField from '../../components/TokenAddressField'
import Transaction from '../Transaction';
import Tokens from '../Tokens';


function App(){
  const today = new Date();
  const current_datetime = new Date().toISOString();

  var theFirstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  // const before_current_datetime = new Date(today.getTime()-1000*3600*24).toISOString();
  const [addressStatus, setAddressStatus] = useState('0xa6364afb914792fe81e0810d5f471be172079f7b');
  const [duration, setDuration] = useState({fromDate:theFirstDay.substring(0,16), toDate:current_datetime.substring(0,16)});
  const [data, setData] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);

  const setAddressWallet = (pAddress) => {
    setAddressStatus(pAddress);
  }
  const setDurationFromField = (pDuration) => {
    setDuration(pDuration);
  }
  const setTotalFromField = (pTotalProfit) => {
    setTotalProfit(pTotalProfit);
  }
  const setDataFromField = (pData) => {
    console.log('I am Data setting')
    setData(pData);
    
  }
    return (
      <Router>
        <div className="container" style={{ minWidth:'100%',backgroundColor:'whie' }}>
          <header style={{ minWidth:'100%' }}>
            
            <a target="_blank" rel="noopener noreferrer" href="#">
              <img alt='Coin Panel Logo' lazy="true" src="./images/coinpanel.svg" />
              Transfer Event List By Address
            </a>
          </header>
          <div className="menuBar">
            <ul>
              <li>
                <Link to="/">Transaction List</Link>
              </li>
              <li>
                <Link to="/token-list">Token List</Link>
              </li>
            </ul>
          </div> 
          <div className="row">
            <div className="col-md-12">
              <div style={{position:'relative',height:70}}>
                <div>
                  <TokenAddressField setAddressWallet={setAddressWallet} duration={duration} setDurationFromField={setDurationFromField} setDataFromField={setDataFromField} setTotalFromField={setTotalFromField} address={addressStatus}/>
                </div>
              </div>
            </div>
          </div>
          {/* <div style={{textAlign:'center'}}> <span style={{fontSize:28,fontWeight:700,color:'grey'}}>{addressStatus}</span></div>
          <div style={{textAlign:'center'}}> <span style={{fontSize:28,fontWeight:700,color:'grey'}}>{duration.fromDate + '--' + duration.toDate}</span></div> */}
          <Switch>
            <Route exact path="/">
              <Transaction addressStatus={addressStatus} duration={duration} tableData = {data}/>
            </Route>
            <Route path="/token-list">
              <Tokens addressStatus={addressStatus} duration={duration} tableData = {data} totalProfit={totalProfit}/>
            </Route>
          </Switch>           
        </div>
      </Router>
    )
  
}

export default App;