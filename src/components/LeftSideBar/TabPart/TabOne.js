import React from 'react';
import BlackBackCommit from './BlackBackCommit';
import ReactTable from "react-table";
import "react-table/react-table.css";
 
const TabOne = () => {
    const {data} ={'data': [
        {"token":"WINDY","balance":0.00,"rate":""},
        {"token":"ORFANO","balance":0.00,"rate":""},
        {"token":"RX","balance":0.00,"rate":""},
        {"token":"MOONSTAR","balance":0.00,"rate":""},
        {"token":"FTN","balance":0.00,"rate":""},
        {"token":"POOCOIN","balance":0.00,"rate":""},
        {"token":"DOGEMOON","balance":0.00,"rate":""},
        {"token":"Safe Jesus","balance":0.00,"rate":""},
        {"token":"frogelon","balance":0.00,"rate":""},
        {"token":"mulimoon","balance":0.00,"rate":""},
        ]
    }

  return <div>
            <BlackBackCommit/>
            <div style={{ marginTop:10, textAlign:'center' }}>
                <a target="_blank" href="#">Promote your token</a>
            </div>
            <div style={{ minHeight:45 }}>

            </div>
            <ReactTable
              data= { data }
              columns={[
                {
                  Header: "Token",
                  accessor: "token"
                },
                {
                  Header: "Balance",
                  accessor: "balance"
                },
                {
                  Header: "",
                  accessor: "rate"
                },
              ]}
              style={{
                height: "300px", // This will force the table body to overflow and scroll, since there is not enough room
                minWidth: "-webkit-fill-available",
                backgroundColor:"#131722"
              }}
              className="-striped -highlight"
            
            />
        </div>;
};

 
export default TabOne