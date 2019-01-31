import React from 'react'

var lastScroll = 0;

export var api_url = (window.location.hostname === 'localhost' ? 'http://betpoint:8001/api/' : 'https://natansports.websiteseguro.com/api/');

function scrollTop() {
    lastScroll = window.scrollY;
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 1)
}
function scrollLast() {
    setTimeout(() => {
        window.scrollTo(0, lastScroll);
    }, 1)
}
function getData(path) {
    return fetch(api_url + path).then(data => data.json());
}
function postData(path, dataInput) {
    return fetch(api_url + path, {
        method: 'post', body: JSON.stringify(dataInput)
    }).then(data => data.json());
}
export function tableSort(key) {

    let direction = this.state.sortField === key ? 1 : -1;

    let data = this.state.items.sort((a, b) => {
        if (a[key] < b[key]) return 1 * direction;
        if (a[key] > b[key]) return -1 * direction;
        return 0;
    });
    this.setState({ items: data, sortField: (key === this.state.sortField ? '' : key) });
}
export function tableSortNumber(key) {

    let data = this.state.sortField === key ?
        this.state.items.sort((a, b) => b[key] - a[key]) :
        this.state.items.sort((a, b) => a[key] - b[key]);

    this.setState({ items: data, sortField: (key === this.state.sortField ? '' : key) });
}
export function hideMore() {

    document.body.className = "";
    document.getElementById('menu-more').className = 'menu-more';
    document.body.removeEventListener('click', hideMore);
}
export function setUser(user) {
    localStorage.setItem("user", JSON.stringify(user))
}
export function getUser() {
    var user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}
Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
export function newButton() {
    return <i className="fas fa-edit mr-2"></i>
}
export function formatNumber(x, color) {
    if (x == null || isNaN(x)) return "";
    var parts = x.toString().split(".");
    if (parts.length == 1)
        parts.push("00");
    if (parts[1].length > 2)
        parts[1] = parts[1].substring(0, 2);
    if (parts[1].length == 1)
        parts[1] += "0";

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (color)
        return <span className={Number(x) == 0 ? "yellow" : Number(x) < 0 ? 'red' : 'green'} >{parts.join(",")}</span>;
    return parts.join(",");
}
export function closeModal() {
    this.setState({ showModal: false });
}
export function num(value) {
    if (value != null) {
        return Number(value.toString().replace(/\./g, '').replace(',', '.'));
    }
    return 0;
}
Array.prototype.sum = function (prop, color) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += isNaN(this[i][prop]) ? 0 : Number(this[i][prop]);
    }
    if (color)
        return <span className={total == 0 ? "yellow" : total < 0 ? 'red' : 'green'} >{formatNumber(total)}</span>;
    return formatNumber(total);
}
Array.prototype.sumString = function (prop, color) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
            let value = num(this[i][prop]);
            total += isNaN(value) ? 0 : Number(value);
    }
    if (color)
        return <span className={total == 0 ? "yellow" : total < 0 ? 'red' : 'green'} >{formatNumber(total)}</span>;
    return formatNumber(total);
}
Array.prototype.sumWithComma = function (prop, color) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
        let numbers = this[i][prop].split(',');
        numbers.forEach(x => {
            total += isNaN(x) ? 0 : Number(x);
        });
    }
    if (color)
        return <span className={total == 0 ? "yellow" : total < 0 ? 'red' : 'green'} >{formatNumber(total)}</span>;
    return formatNumber(total);
}
Array.prototype.sumInt = function (prop) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += isNaN(this[i][prop]) ? 0 : Number(this[i][prop]);
    }
    return total;
}
export { scrollTop, scrollLast, getData, postData } 
