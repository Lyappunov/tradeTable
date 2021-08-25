import React from 'react';
import {FaGoogle} from 'react-icons/fa'

const SearchPart = () => {
  return <div style={{ textAlign:'center', color:'white' }}>
            <div className="d-flex mb-2 px-2" style={{maxWidth: 500}}>
                <form className="input-group">
                    <input type="text" className="form-control form-control-sm" name="" placeholder="Token Search..." value=""/>
                    <button className="btn btm-sm btn-primary" type="submit" style={{ maxHeight:32, paddingTop:3 }}>
                        <FaGoogle/>
                    </button>
                </form>
            </div>
            <div className="d-flex mb-1 px-2" style={{maxWidth: 500}}>
                <input type="text" className="form-control form-control-sm" name="" placeholder="Filter..." value=""/>
            </div>
        </div>;
};
 
export default SearchPart;