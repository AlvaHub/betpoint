import React, { Component } from 'react'
import * as common from './Common';
import { withRouter } from 'react-router-dom';

class MenuIcon extends Component {


    showMore(e) {
        e.stopPropagation();
        document.getElementById('menu-more').className = 'menu-more menu-come';
        //document.body.addEventListener('click', common.hideMore);
        setTimeout(() => {
            document.body.className = 'no-overflow';
        }, 600);
    }
    redirect = (path, e) => {

        if (document.location.pathname !== path)
            this.props.history.push(path);
        else {
            this.props.history.push('/default');
            setTimeout(() => {
                this.props.history.push(path);
            }, 1);
        }

    }
    render() {
        return (
            <div>
                <div><i onClick={this.showMore} className="fas fa-bars ml-2"></i>
                    <i onClick={() => { this.redirect('/') }} className="fas fa-futbol ml-3 pointer hidden-xs" title="Consolidado"></i>
                    <i onClick={() => { this.redirect('/risk-profit') }} className="fas fa-chart-line ml-3 pointer hidden-xs" title="Risco e Lucro"></i>
                    <i onClick={() => { this.redirect('/risk-profit-cev') }} className="fas fa-chart-bar ml-3 pointer hidden-xs" title="Risco CEV"></i>
                </div>
            </div>
        )
    }
}
export default withRouter(MenuIcon)