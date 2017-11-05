import React, { Component } from 'react';
import './App.css';
import {FormControl, ControlLabel, Button}  from 'react-bootstrap';
import {Doughnut} from 'react-chartjs-2';
import api from './api.js';

const API_KEY = (api === 'undefined') ? "NO_API_KEY" : api.key

class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      status: "adding",
      addedFood: [],
      value: "",
      items: [],
      gotItems: [],
      bodyWeight: null,
      totalCal: 0,
      reducedFood:[]
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleAddFood = this.handleAddFood.bind(this)
    this.handleAllFoodDone = this.handleAllFoodDone.bind(this)
    this.pickMe = this.pickMe.bind(this)
    this.goBack = this.goBack.bind(this)
    this.removeFromList= this.removeFromList.bind(this)
    this.handleBW= this.handleBW.bind(this)
    this.goAgain= this.goAgain.bind(this)
  }
  
  goAgain(){
    this.setState({
      status: "adding",
      addedFood: [],
      value: "",
      items: [],
      gotItems: [],
      totalCal: 0,
      reducedFood: []
    })
  }

  handleBW(e){
    this.setState({
      bodyWeight: (isNaN(e.target.value)) ? this.state.bodyWeight : e.target.value
    })
  }

  handleChange(e) {
    this.setState({ 
      value: e.target.value }
    );
  }

  handleAddFood(){
    fetch('http://api.nal.usda.gov/ndb/search/?format=json&q='+ this.state.value +'&sort=n&max=50&offset=0&api_key=' + API_KEY).then( result =>{
      if(result.status === 200){
        return result.json()
      }
      else{
        return null
      }
    }).then( value =>
      this.setState({
        items: this.state.items.concat(value.list.item), 
        value: "",
        status: "picking"
      })
    ).catch( err => {
      alert("No Results Found, Try Again")
    })
  }

  handleAllFoodDone(){
    var x = []
    Promise.resolve(this.state.addedFood.map((food, i, c)=> {
      return fetch('http://api.nal.usda.gov/ndb/reports/?ndbno='+ food.ndbno +'&type=b&format=json&api_key='+API_KEY).then( result =>
        (result.status === 200) ? result.json() : null
      ).then( value => {
        //this.setState({gotItems: this.state.gotItems.concat(value.report.food)})
        this.setState({reducedFood: this.state.reducedFood.concat(this.minimizeJson(value.report.food))})
        //x = x.concat(value.report.food)
        if(false){
          console.log(c.length)
          this.setState({
            reducedFood: x.reduce((sum, valuex) => {
            return sum.concat(this.minimizeJson(valuex))
          }, [])
        })
      }
      })
    })).then(
      this.setState({status: "display"})
    )
  }

  getNames(value){
    return value.list.item.map(e => e.name)
  }

  pickMe(e){
    const toAdd = this.state.items[parseInt(e.currentTarget.attributes['okey'].nodeValue, 10)]
    this.setState({
      addedFood: this.state.addedFood.concat(toAdd),
      status:"adding",
      items:[]
    })
  }

  goBack(){
    this.setState({
      status:"adding",
      items:[]
    })
  }

  removeFromList(e) {
    const cut = this.state.addedFood[parseInt(e.currentTarget.attributes['okey'].nodeValue, 10)]
    var arr = this.state.addedFood
    arr.splice(cut, 1)
    this.setState({
      addedFood: arr
    })
  }

  minimizeJson(e) {
    console.log(e)
    return {
      name: e.name,
      calories: e.nutrients.reduce((sum, value) => {
        if (value.nutrient_id === "208") {
          this.setState({ totalCal: this.state.totalCal + parseInt(value.value, 10) })
          return sum + parseInt(value.value, 10)
        }
        else {
          return sum + 0
        }
      }, 0)
    }

  }

  dynamicColors(){
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
}

  render() {
    const data = {
      labels: (typeof this.state.reducedFood !== 'undefined' && this.state.reducedFood.length > 0) ? this.state.reducedFood.map(e => e.name) : [],
      datasets: [{
        data: (typeof this.state.reducedFood !== 'undefined' && this.state.reducedFood.length > 0) ? this.state.reducedFood.map(e => e.calories) : [],
        backgroundColor: (typeof this.state.reducedFood !== 'undefined' && this.state.reducedFood.length > 0) ? this.state.reducedFood.map(e => this.dynamicColors()) : [],
        hoverBackgroundColor: (typeof this.state.reducedFood !== 'undefined' && this.state.reducedFood.length > 0) ? this.state.reducedFood.map(e => this.dynamicColors()) : []
      }]
    }//(typeof this.state.reducedFood !== 'undefined' && this.state.reducedFood.length > 0) ? this.state.reducedFood.map(e => e.calories) : []
    if(this.state.status === "adding"){
      return (
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Beat What You Eat</h1>
          </header>
          <div className="container">
            <div className="container moreTop">
              {this.state.addedFood.map( (e, i) => {
              return <div key={i} okey={i} className="possible-food list moreTop" onClick={this.removeFromList}> {e.name} </div>})}
            </div>
            <div className ="row moreTop">
              <div className="col-3">
                <ControlLabel>Enter Body Weight</ControlLabel>
                <FormControl type="text" value={this.state.bodyWeight} placeholder="In pounds" onChange={this.handleBW}/>
                {(this.state.addedFood.length > 0 && this.state.bodyWeight > 0) ? <Button className="moreTop pull-left" bsStyle="success" onClick={this.handleAllFoodDone}>All Foods Entered</Button>: null}
              </div>
              <div className="col-9">
                <ControlLabel>Enter {(this.state.addedFood.length > 0) ? "more" : null} food or drink</ControlLabel>
                <FormControl type="text" value={this.state.value} placeholder="Cheerios" onChange={this.handleChange}/>
                {(this.state.value.length > 0) ? <Button className="moreTop pull-left" bsStyle="primary" onClick={this.handleAddFood}>Enter</Button> : null}
              </div>
            </div>
            <div className="container desc">
              <h1 className="list moreTop"> How do I use? </h1>
              Beat what you eat is a simple application that is designed to tell you how much you need to run in order to work off a certain amount of food or drink.

              Just enter in what you had, or enter it's UPC code. Additionally, enter your body weight. On the next page, pick what you ate.

              You can remove something by clicking it on the list above.

              Hit "All Foods Entered" to see your results!
            </div>
          </div>
        </div>
      );
    }
    else if(this.state.status === "picking"){
      return(
        <div className="App list">
        <header className="App-header">
          <h1 className="App-title">Beat What You Eat</h1>
        </header>
        <Button className="moreTop" bsStyle="danger" onClick={this.goBack}>Go back</Button>
        {this.state.items.map( (e, i) => {
          return <div key={i} okey={i} onClick={this.pickMe} className="possible-food moreTop"> {e.name} </div>})}
        </div>
      );
    }
    else if(this.state.status === "display"){
      return(
        <div className="App list">
          <header className="App-header">
            <h1 className="App-title">Beat What You Eat</h1>
          </header>
          <Button className="moreTop" bsStyle="danger" onClick={this.goAgain}>Try Again!</Button>
          {
            <div className="moreTop"> You need to run  {(this.state.totalCal / (this.state.bodyWeight * .75)).toPrecision(5)} miles to burn off that extra {this.state.totalCal} calories of food with a body weight of {this.state.bodyWeight} lbs.</div>
          }
          <div className="moreTop">See the breakdown!</div>
          {(typeof this.state.reducedFood !== 'undefined' )?this.state.reducedFood.map( (e, i) => {
              return <div className="moreTop" key={i}> {e.name} has {e.calories} calories </div>
          }):null}
          <div className="container moreTop">
            <Doughnut data={data} />
          </div>
          <div className="moreTop">
            Calcualtions based from: <a href="https://www.livestrong.com/article/314404-how-many-calories-do-you-lose-per-mile/"> https://www.livestrong.com/article/314404-how-many-calories-do-you-lose-per-mile/ </a>
          </div>
        </div>
      )
    }
  }
}

export default App;
