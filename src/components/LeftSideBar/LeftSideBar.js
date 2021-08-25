import React from 'react';
import SideBarHeader from './SideBarHeader'
import SearchPart from './SearchPart'
import TabPart from './TabPart'
import TabOne from './TabPart/TabOne'
import TabTwo from './TabPart/TabTwo'
import TabThree from './TabPart/TabThree'
import TabFour from './TabPart/TabFour'
 
const LeftSideBar = () => {
  return <div>
            <div>
                <SideBarHeader/>
            </div>
            <div style={{ marginTop:20, borderBottom:'1px solid #262626',paddingBottom:20 }}>
                <SearchPart/>
            </div>
            <div style={{ marginTop:20, borderBottom: '1px solid #262626' }}>
                <TabPart>
                    <div label="Promoted"> 
                        <TabOne/> 
                    </div> 
                    <div label="Wallet"> 
                        <TabTwo/> 
                    </div> 
                    <div label="Started"> 
                        <TabThree/>
                    </div> 
                    <div label="History"> 
                        <TabFour/>
                    </div> 
                </TabPart>
            </div>
        </div>;
};
 
 
export default LeftSideBar;