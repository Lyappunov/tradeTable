import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.css";
import './index.scss'
import '../index.css'

// import TradingViewChart from '../../components/TradingViewChart'
import TransactionList from '../../components/TransactionList'

// import LeftSideBar from '../../components/LeftSideBar/LeftSideBar'


function Transaction(props){
  console.log('here is Transaction data', props.tableData)
    return (
        
        <div className="container" style={{ minWidth:'100%',backgroundColor:'whie' }}>
          
          <div className="row">
            
            <div className="col-md-10" style={{ margin:'auto' }}>
              <div style={{fontSize:26, fontWeight:600, color:"grey"}}>Transaction List</div>
              <div className="trading-chart" style={{ backgroundColor:'white', width:'100%', maxHeight:680, marginTop:20}}>
                <TransactionList addressStatus={props.addressStatus} duration={props.duration} data={props.tableData}/>
              </div>
            </div>
            
          </div>
            
        </div>

    )
  
}

export default Transaction;