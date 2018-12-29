import React, { Component } from 'react';
import * as common from '../Common';


class Passenger extends Component {
  constructor(props) {
    super(props);

    this.barList();
    this.bindList();

  }
  state = {
    items: [],
    itemsAll: [],
    sortField: '',
    filter: '',
    permissions: [],
    data: {},


  }
  barList() {
    this.props.changeTitle({ left: <div><i className="fas fa-plane"></i> BetPoint</div>, center: 'Aeronave' });
  }
  barForm = () => {
    this.props.changeTitle({ left: <div className="btn-back" onClick={this.back.bind(this)}><i className="fas fa-arrow-alt-circle-left"></i> Voltar</div> });
  }
  bindList() {
    this.props.show();
    var that = this;
    common.getData('airplane').then((data) => { that.props.hide(); this.setState({ items: data, itemsAll: data }) })
  }
  newData() {
    common.scrollTop();
    this.setState({ data: this.getNewData() });
    document.getElementById('new').className = 'form come';
    document.getElementById('list').className = 'hidden';

    this.barForm();
  }
  back() {
    this.barList();
    document.getElementById('new').className = 'form go';
    document.getElementById('list').className = '';
    common.scrollLast();
  }
  editData(item) {
    this.props.show();
    common.getData('airplane/' + item.id).then((data) => {
      this.props.hide();
      common.scrollTop();
      data.active = data.active === 1;
      this.setState({ data: data })
      document.getElementById('new').className = 'form come';
      document.getElementById('list').className = 'hidden';
      this.barForm();
    });
  }
  save() {
    this.props.show();
    var that = this;
    common.postData('airplane', this.state.data).then(function (data) {
      that.props.hide();
      that.bindList();
      that.back();
    });

  }
  getNewData() {

    return {
      id: 0,
      active: 1,
      permission_id: 1
    }
  }
  handleChange = e => {
    let data = this.state.data;
    if (e.target.type === 'checkbox')
      data[e.target.name] = e.target.checked ? 1 : 0;
    else
      data[e.target.name] = e.target.value;

    this.setState({ data })

  }
  filter(e) {
    let items = [];
    if (e.target.value === '')
      items = this.state.itemsAll;
    else
      items = this.state.itemsAll.filter(x => x.name.toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0);
    this.setState({ items });
  }
  render() {

    return (
      <React.Fragment>
        <div id="list">
          {this.state.items.map((x,i) => <div className="rounded" key={i} >
            <div className="p-1 font-lg font-weight-bold text-white" >{x.name}</div>
            <div className="p-1 rounded">
              <table className="table table-sm text-white">
                <thead>
                  <tr><th colSpan="2" className="bg-cream-dark" ><i className="far fa-clock"></i> <b>Odômetro</b></th></tr>
                </thead>
                <tbody>
                  <tr><td className="w-50"><div className="text-info"><b>Airframe</b></div></td><td>{x.airframe}</td></tr>
                  <tr><td><div className="text-success"><b>L Engine</b></div></td><td>{x.engine_L}</td></tr>
                  <tr><td><div className="text-orange"><b>R Engine</b></div></td><td>{x.engine_R}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="p-1 rounded">
              <table className="table table-sm text-white">
                <thead>
                  <tr><th colSpan="2" className="bg-cream-dark" ><i className="fas fa-globe"></i> <b>Etapas</b></th></tr>
                </thead>
                <tbody>
                  <tr><td className="w-50"><div className="text-info"><b>L Cycles</b></div></td><td>{x.cycles_L}</td></tr>
                  <tr><td><div className="text-success"><b>R Cycles</b></div></td><td>{x.cycles_R}</td></tr>
                  <tr><td><div className="text-orange"><b>LDGS</b></div></td><td>{x.ldgs}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
        <div id="new" className="form" >
          <div>
            <div className="label">Nome</div>
            <input type="text" placeholder="Nome..." className="form-control" name="name" value={this.state.data.name || ""} onChange={this.handleChange}  ></input>
          </div>
          <div>
            <div className="label">Ativo</div>
            <input type="checkbox" placeholder="Senha..." name="active" checked={this.state.data.active || ""} onChange={this.handleChange}  ></input>
          </div>
          <div className="text-right pt-2">
            <button className="btn btn-main" onClick={this.save.bind(this)} >Salvar</button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Passenger;
