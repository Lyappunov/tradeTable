import React from 'react';
import BlackBackCommit from './BlackBackCommit';
 
const TabTwo = () => {
  return <div>
            <BlackBackCommit/>
            <div style={{ marginTop:10, textAlign:'right' }}>
                <a target="_blank" href="#">Restore Hidden</a>
            </div>
            <div style={{ color:"white", fontSize:18, textAlign:'center', marginTop:30 }}>
                Connect your wallet to see your tokens.
            </div>
        </div>;
};

 
export default TabTwo