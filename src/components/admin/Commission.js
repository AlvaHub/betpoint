import React, { Component } from 'react';
import * as common from '../Common';
import CurrencyFormat from 'react-currency-format';


class Commission extends Component {
  constructor(props) {
    super(props);

    this.barList();
  }
  componentDidMount() {
    this.bindList();
  }
  state = {
    items: [],
    itemsAll: [],
    sortField: '',
    filter: '',
    permissions: [],
    data: {},
    multipliers: [],
    profits: [],
    commissions: [],
    bookmakers: []

  }
  barList() {
    this.props.changeTitle({ left: null, center: 'Comissão', right: <div onClick={this.newData.bind(this)} >{common.newButton()}</div> });
  }
  barForm = () => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={this.back.bind(this)}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div> });
  }
  bindList() {
    this.props.show();
    var that = this;
    common.getData('commission').then((data) => {
      that.props.hide();
      var last = '######';
      var alternate = true;
      data.forEach(x => {
        if (x.bookmaker_name !== last)
          alternate = !alternate;
        x.css = alternate ? 'normal' : 'alternate';
        last = x.bookmaker_name;
        if (x.login_group !== "*") {
          let parent = data.find(y => y.bookmaker_name === x.bookmaker_name && y.login_group === "*");
          if(parent != null){
            x.css += ' group-child';
            x.placeholder_win = parent.percent_win;
            x.placeholder_loss = parent.percent_loss;
          }
          
        }

      });
      this.setState({ items: data, itemsAll: data })
    })
  }
  newData() {
    common.scrollTop();
    this.setState({ data: this.getNewData() });
    document.getElementById('new').className = 'form come';
    document.getElementById('list').className = 'hidden';
    document.getElementById('filter').className = 'hidden';

    this.barForm();
  }
  back() {
    this.barList();
    document.getElementById('new').className = 'form go';
    document.getElementById('list').className = 'table-responsive';
    document.getElementById('filter').className = 'filter';
    common.scrollLast();
  }
  handleFocus = (x, e) => {
    this.setState({ original_value: e.target.value });
  }
  handleChange = (x, e) => {
    let items = this.state.items;
    let item = items.filter(y => y.login_name === x.login_name)[0];

    if (e.target.type === 'checkbox')
      item[e.target.name] = e.target.checked ? 1 : 0;
    else
      item[e.target.name] = e.target.value;

    this.setState({ items })

  }
  handleSave = (x, e) => {
    let field = e.target.name;
    let value = !x[field] ? "" : x[field].trim();

    if (field === "login_group") {
      if (value !== "*" && value !== "") {
        let logins = value.split(',');
        let items = this.state.itemsAll;
        let allFound = true;
        logins.forEach(x => {
          x = x.trim();
          if (items.find(y => y.login_name === x) == null) {
            allFound = false;
            alert('Login ' + x + ' não existe!');
            return;
          }
        });
        if (!allFound) {
          let items = this.state.items;
          let item = items.filter(y => y.login_name === x.login_name)[0];
          item.login_group = this.state.original_value;
          this.setState({ items });
          return;
        }
      }
    }
    else if (field === "distribution") {
      let message = 'Entrada inválida. Ex: fulano:50, beltrano:25';
      if (value !== "") {
        let logins = value.split(',');
        let items = this.state.itemsAll;
        let allFound = true;
        logins.forEach(x => {
          let values = x.trim().split(':');
          if(values.length !== 2 || isNaN(values[1])) {
            allFound = false;
            return alert(message);
          }
          if (items.find(y => y.bookmaker_name === values[0]) == null) {
            allFound = false;
            return alert('Cambista ' + x + ' não existe!');
          }
        });
        if (!allFound) {
          let items = this.state.items;
          let item = items.filter(y => y.distribution === x.distribution)[0];
          item.distribution = this.state.original_value;
          this.setState({ items });
          return;
        }
      }
    }
    let item = { id: x.id, [field]: value };
    console.log(item);
    common.postData('commission', item).then(function (data) {
      console.log(data);
    });
  }
  filter(e) {
    let items = [];
    if (e.target.value === '')
      items = this.state.itemsAll;
    else {
      let value = e.target.value.toLowerCase();
      items = this.state.itemsAll.filter(x => x.login_name.toLowerCase().indexOf(value) >= 0 || (x.bookmaker_name + "").toLowerCase().indexOf(value) >= 0);
    }
    this.setState({ items });
  }
  render() {

    return (
      <React.Fragment>
        <div className="filter" id="filter" >
          <input type="text" className="form-control form-control-sm col-lg-8 offset-lg-2" placeholder="Buscar..." onChange={this.filter.bind(this)} />
        </div>
        <div className="div-table" ></div>
        <div id="list" className="div-commission table-responsive col-lg-8 offset-lg-2">
          <table className="table table-dark table-bordered table-sm text-center table-commission table-scroll" >
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Login</th>
                <th>Ganho</th>
                <th>Perda</th>
                <th>Grupo Contas</th>
                <th>Rateio</th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map(x => <tr key={x.id} className={x.css} >
                <td>{x.bookmaker_name}</td>
                <td>{x.login_name}</td>
                <td>
                  <CurrencyFormat type="tel" placeholder={x.placeholder_win}  onBlur={this.handleSave.bind(this, x)} name="percent_win" value={x.percent_win || ""} decimalSeparator="." onChange={this.handleChange.bind(this, x)} />
                </td>
                <td>
                  <CurrencyFormat type="tel" placeholder={x.placeholder_loss} onBlur={this.handleSave.bind(this, x)} name="percent_loss" value={x.percent_loss || ""} decimalSeparator="." onChange={this.handleChange.bind(this, x)} />
                </td>
                <td>
                  <input type="text" className={'text-left ' + (x.login_group === "*" ? "big" : "")} onFocus={this.handleFocus.bind(this, x)} onBlur={this.handleSave.bind(this, x)} name="login_group" value={x.login_group || ""} onChange={this.handleChange.bind(this, x)} />
                </td>
                <td> <input type="text" className={'text-left'} onFocus={this.handleFocus.bind(this, x)} onBlur={this.handleSave.bind(this, x)} name="distribution" value={x.distribution || ""} onChange={this.handleChange.bind(this, x)} />
               </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="page-margin-bottom" ></div>
      </React.Fragment>
    );
  }
}

export default Commission;
