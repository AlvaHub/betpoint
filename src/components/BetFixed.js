import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as common from './Common';
import ReactTooltip from 'react-tooltip';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import MomentLocaleUtils, { formatDate, parseDate } from 'react-day-picker/moment';
import 'moment/locale/pt-br';
import MyModal from './MyModal';
import CurrencyFormat from 'react-currency-format';


class BetFixed extends Component {
  constructor(props) {
    super(props);

    this.barList();
  }
  barList() {
    this.props.changeTitle({
      left: null, center: <div className="pointer" onClick={this.bindList.bind(this)} >Consolidado Montantes</div>, right: <div className="" onClick={this.showFilter.bind(this)}><i className="fas fa-filter show-xs"></i></div>
    });
  }
  barForm = (title) => {
    this.props.changeTitle({
      left: <div className="btn-back" onClick={() => this.back()}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div>, center: title,
      right: <i className="fas fa-exchange-alt mr-2" onClick={() => { this.setState({ showModal: true, login_destination: "0" }); }}></i>
    });
  }
  back() {
    this.barList();
    document.getElementById('detail').className = 'form  pb-0 go';
    document.getElementById('list').className = '';
    document.getElementById('filter').className = 'filter hidden-xs';
    common.scrollLast();

  }
  bindList() {
    this.props.show();
    var that = this;
    let date_from = formatDate(this.state.date_from, "YYYY-MM-DD");
    let date_to = formatDate(this.state.date_to, "YYYY-MM-DD");
    common.getData(`bet-fixed/DE/${date_from}/${date_to}`).then((data) => {

      that.props.hide();
      data.forEach(x => {
        x.vale = common.formatNumber(x.vale);
        x.atual = common.formatNumber(x.atual);
        x.profit_percent = common.formatNumber(x.profit_percent);
        x.volume = common.formatNumber(x.volume);
        x.pendente = common.formatNumber(x.pendente);
        x.parcial = common.formatNumber(x.parcial);
        x.comissao = common.formatNumber(x.comissao);
        x.total = common.formatNumber(x.total);
        x.resultado = common.formatNumber(x.resultado);
      });
      this.setState({ descarregos: data })
    });
  }

  componentDidMount() {
    this.bindList();
    common.getData('combo/betlogin').then((data) => { this.setState({ betlogins: data }) })
  }
  state = {
    itemsAll: [],
    items: [],
    details: [],
    date_from: this.getLastMonday(),
    date_to: new Date(this.getLastMonday()).addDays(6),
    betlogins: [],
    login_destination: "0",
    descarregos: [],
  }
  saveData = () => {
    let data = {
      user_id : common.getUser().id,
      date_start: formatDate(this.state.date_from, "YYYY-MM-DD"),
      date_end: formatDate(this.state.date_to, "YYYY-MM-DD"),
      descarregos: this.state.descarregos
    }
    common.postData('bet-fixed', data).then((data) => {
      if (data === 1) {
        alert('Dados salvos com sucesso!');
      }
    });
  }
  getLastMonday() {
    var index = 0;
    var date_from = null;
    while (true || index < 7) {
      date_from = new Date().addDays(index)
      if (formatDate(date_from, "dddd") === "Monday")
        break;
      index--;
    }
    return date_from;
  }
  handleChange = (index, e) => {
    let descarregos = this.state.descarregos;
    descarregos[index][e.target.name] = e.target.value;
    this.setState({ descarregos })
  }
  handleChangeDetail = (index, e) => {
    let details = this.state.descarrego;
    if (e.target.type === 'checkbox')
      details[index][e.target.name] = e.target.checked ? 1 : 0;
    else
      details[index][e.target.name] = e.target.value;
    this.setState({ details })

  }
  showFilter() {
    var css = document.getElementById('filter').className;
    css = css.indexOf('hidden-xs') > 0 ? 'filter' : 'filter hidden-xs';
    document.getElementById('filter').className = css;
  }
  hideFilter() {
    document.getElementById('filter').className = 'filter hidden-xs';
  }
  filter(e) {
    let items = [];
    if (e.target.value == '')
      items = this.state.itemsAll;
    else {
      let value = e.target.value.toUpperCase();
      items = this.state.itemsAll.filter(x =>
        (x.conta + "").toUpperCase().indexOf(value) >= 0 || (x.cliente + "").toUpperCase().indexOf(value) >= 0);
    }

    this.setState({ items });
  }

  handleDayChange(selectedDay, modifiers, dayPickerInput) {
    this.setState({ [dayPickerInput.props.name]: selectedDay })

    setTimeout(() => {
      this.bindList();
    }, 1);

  }
  changeWeek = (signal) => {
    let date_from = this.state.date_from.addDays(7 * signal);
    let date_to = this.state.date_to.addDays(7 * signal);
    this.setState({ date_from, date_to });

    setTimeout(() => {
      this.bindList();
    }, 1);
    setTimeout(() => { this.hideFilter() }, 1000);
  }
  render() {

    return (
      <React.Fragment>
        <div className="filter hidden-xs" id="filter">
          <div className="row no-gutters" >
            <div className="col-12 col-sm-4 p-1">
              <input type="text" className="form-control form-control-sm" placeholder="Buscar..." onChange={this.filter.bind(this)} />
            </div>
            <div className="col-6 col-sm-3 p-1">
              <DayPickerInput name="date_from" dayPickerProps={{ selectedDay: this.state.date_from }}
                placeholder={formatDate(this.state.date_from, 'DD/MM/YYYY')} onDayChange={this.handleDayChange.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{ readOnly: true }} />
            </div>
            <div className="col-6 col-sm-3 p-1 date-to">
              <DayPickerInput name="date_to"
                placeholder={formatDate(this.state.date_to, 'DD/MM/YYYY')} onDayChange={this.handleDayChange.bind(this)} parseDate={parseDate} formatDate={formatDate}
                dayPickerProps={{ locale: 'pt-br', localeUtils: MomentLocaleUtils }} inputProps={{ readOnly: true }} />
            </div>
            <div className="col-12 col-sm-2 p-1 align-self-center text-center">
              <i className="fas fa-arrow-left mr-4 text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, -1)} ></i>
              <i className="fas fa-arrow-right  text-secondary font-icon pointer" onClick={this.changeWeek.bind(this, 1)} ></i>
            </div>
          </div>
        </div>
        <div className="margin-top-filter margin-top-filter-xs" ></div>
        <div id="list">
          <div className="div-table-consolidado" >
            <table className="table table-dark table-bordered table-striped table-sm table-consolidado table-scroll hidden-xs w-100" >
              <thead id="table-consolidado-head" >
                <tr>
                  <th className="text-center" colSpan="13">DESCARREGO</th>
                </tr>
                <tr>
                  <th onClick={common.tableSort.bind(this, 'conta')} >Conta</th>
                  <th onClick={common.tableSort.bind(this, 'cliente')} >Cliente</th>
                  <th onClick={common.tableSortNumber.bind(this, 'qtd')} >Qtd</th>
                  <th onClick={common.tableSortNumber.bind(this, 'volume')} >Volume</th>
                  <th onClick={common.tableSortNumber.bind(this, 'vale')} >Vale</th>
                  <th onClick={common.tableSortNumber.bind(this, 'atual')} >Atual</th>
                  <th onClick={common.tableSortNumber.bind(this, 'pendente')} >Pend</th>
                  <th onClick={common.tableSortNumber.bind(this, 'um')} >uM</th>
                  <th onClick={common.tableSortNumber.bind(this, 'parcial')} >Parcial</th>
                  <th onClick={common.tableSortNumber.bind(this, 'comissao')} >Com</th>
                  <th onClick={common.tableSortNumber.bind(this, 'total')} >Total</th>
                  <th onClick={common.tableSortNumber.bind(this, 'profit_percent')} >%</th>
                  <th onClick={common.tableSortNumber.bind(this, 'resultado')} >Resultado</th>
                </tr>
                <tr className="font-xs totals">
                  <th></th>
                  <th></th>
                  <th>{this.state.descarregos.sumInt('qtd')}</th>
                  <th>{this.state.descarregos.sumString('volume')}</th>
                  <th>{this.state.descarregos.sumString('vale')}</th>
                  <th>{this.state.descarregos.sumString('atual')}</th>
                  <th>{this.state.descarregos.sumString('pendente', true)}</th>
                  <th></th>
                  <th>{this.state.descarregos.sumString('parcial', true)}</th>
                  <th>{this.state.descarregos.sumString('comissao')}</th>
                  <th>{this.state.descarregos.sumString('total', true)}</th>
                  <th></th>
                  <th>{this.state.descarregos.sumString('resultado', true)}</th>
                </tr>
              </thead>
              <tbody>
                {this.state.descarregos.map((x, i) => <tr key={i} id={x.conta} >
                  <td>{x.conta}</td>
                  <td>{x.cliente}</td>
                  <td><CurrencyFormat name="qtd" type="tel" value={x.qtd || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange.bind(this, i)} /></td>
                  <td><CurrencyFormat name="volume" value={x.volume || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange.bind(this, i)} /></td>
                  <td><CurrencyFormat name="vale" value={x.vale || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange.bind(this, i)} /></td>
                  <td><CurrencyFormat name="atual" value={x.atual || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange.bind(this, i)} /></td>
                  <td><CurrencyFormat name="pendente" value={x.pendente || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange.bind(this, i)} /></td>
                  <td><CurrencyFormat name="um" type="tel" value={x.um || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange.bind(this, i)} /></td>
                  <td><CurrencyFormat name="parcial" value={x.parcial || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange.bind(this, i)} /></td>
                  <td><CurrencyFormat name="comissao" value={x.comissao || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange.bind(this, i)} /></td>
                  <td><CurrencyFormat name="total" value={x.total || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange.bind(this, i)} /></td>
                  <td><CurrencyFormat name="profit_percent" value={x.profit_percent || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange.bind(this, i)} /></td>
                  <td><CurrencyFormat name="resultado" value={x.resultado || ""} thousandSeparator={'.'} decimalSeparator="," onChange={this.handleChange.bind(this, i)} /></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="text-right p-1">
            <button type="button" className="btn btn-success" onClick={this.saveData}>Salvar</button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(BetFixed);
