import React from 'react'
import * as common from './Common';

function showMore(e) {
    e.stopPropagation();
    document.getElementById('menu-more').className = 'menu-more menu-come';
    document.body.addEventListener('click', common.hideMore);
  }
function MenuIcon(props) {
    return ( 
        <div onClick={showMore}  ><i className="fas fa-bars ml-2"></i><div></div></div>
    )
}
export default MenuIcon