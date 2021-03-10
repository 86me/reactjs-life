import React, {Component} from 'react';
import Reflux from 'reflux';
import InputRange from 'react-input-range';
import './App.css';
import 'react-input-range/lib/css/index.css';
var createReactClass = require('create-react-class');

var Actions = Reflux.createActions([
  "updateCellStatus"
]);


var CellStore = Reflux.createStore({
  listenables: [Actions],

  updateCellStatus: function(row, col) {
    var body = { row: row, col: col };
    this.trigger(body);
  }
});

class Cell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAlive: null
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    Actions.updateCellStatus(this.props.row, this.props.col);
    this.setState({ isAlive: !this.state.isAlive });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ isAlive: nextProps.isAlive });
  }

  render() {
    var cellStyle = {
      width: 4,
      height: 4,
      dislay: "inline-block",
      float: "left",
      border: "1px solid #000",
      background: this.state.isAlive ? "#FFF" : "#333"
    };

    return (
      <div onClick={this.onClick} style={cellStyle}></div>
    );
  }
}

class Buttons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "Pause"
    };
  }

  render() {
    var margin = { margin: "10px 5px", textAlign: "center" };

    return (
      <div style={margin}>
        <button style={margin} type="button" onClick={this.props.pause} className="btn btn-warning btn-sm sharp">{this.state.text}</button>
        <button style={margin} type="button" onClick={this.props.reset} className="btn btn-warning btn-sm sharp">Reset</button>
        <button style={margin} type="button" onClick={this.props.clear} className="btn btn-warning btn-sm sharp">Clear</button>
      </div>
    );
  }
}

class Slider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delay: 2048
    };
  }

  handleChange(delay) {
    //console.log(delay);
  }

  render() {
    return (
      <form className="form">
      <span className="delay">Delay</span>
      <InputRange
        id="slider"
        formatLabel={value => `${value}ms`}
        minValue={1}
        maxValue={2048}
        value={this.state.delay}
        onChange={delay => this.setState({delay})}
        onChangeComplete={delay => this.handleChange(delay)}
        /*onChangeComplete={delay => console.log(this)}*//>
      </form>
    );
  }
}

class Generation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      generation: 0
    };
  }

  render() {
    return (
      <h4 id="generation">Generation: {this.state.generation}</h4>
    );
  }
}


var Grid = createReactClass({
  mixins: [Reflux.listenTo(CellStore, "onCellClick")],
    getGridSize: function(url = new URL(document.location)) {
      fetch(url).then(function(response) {
        return response.searchParams;
      }).then(function(data) {
          console.log(data);
          alert(data);
      }).catch(function() {
  })
},

  getInitialState: function() {
    return {
      /*
      smallSize: 98,
      size: 136,
      */
      smallSize: 49,
      size: 67,
      grid: [],
      neighborCells: [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]]
    };
  },

  componentWillMount: function() {
    function Cell() {
      this.isAlive = Math.random() > 0.7;
      this.neighbors = 0;
    }
    var grid = [];
    for(var i = 0; i < this.state.size; i++) {
      var row = [];
      for(var j = 0; j < this.state.size; j++) {
        row.push(new Cell());
      }
      grid.push(row);
    }
    this.setState({ grid: grid });
    this.renderGrid();
  },

  onCellClick: function(body) {
    var row = body.row;
    var col = body.col;
    var cell = this.state.grid[row][col];
    cell.isAlive = !cell.isAlive;
  },

  pause: function(e) {
    if(e.target.innerHTML === "Pause") {
      clearInterval(this.interval);
      this.refs.buttons.setState({ text: "Start" });
    } else {
      this.refs.buttons.setState({ text: "Pause" });
      this.renderGrid();
    }
  },

  reset: function() {
    clearInterval(this.interval);

    for(var i = 0; i < this.state.size; i++) {
      for(var j = 0; j < this.state.size; j++) {
        var cell = this.state.grid[i][j];
        cell.isAlive = Math.random() > 0.7;
      }
    }

    this.refs.generation.setState({ generation: 0 });
    this.refs.buttons.setState({ text: "Pause" });
    this.renderGrid();
  },

  clearBoard: function() {
    clearInterval(this.interval);

    for(var i = 0; i < this.state.size; i++) {
      for(var j = 0; j < this.state.size; j++) {
        var cell = this.state.grid[i][j];
        cell.isAlive = false;
      }
    }

    this.refs.generation.setState({ generation: 0 });
    this.refs.buttons.setState({ text: "Pause" });
    this.forceUpdate();
  },

  isWithinGrid: function(row, col) {
    return row >= 0 && row < this.state.size && col >= 0 && col < this.state.size;
  },

  getNeighbors: function(row, col) {
    var cell = this.state.grid[row][col];
    cell.neighbors = 0;
    for(var i = 0; i < this.state.neighborCells.length; i++) {
      var position = this.state.neighborCells[i];
      var r = position[0];
      var c = position[1];
      if(this.isWithinGrid(row + r, col + c)) {
        var neighbor = this.state.grid[row + r][col + c];
        if(neighbor.isAlive) cell.neighbors++;
      }
    }
  },

  updateCellState: function(row, col) {
    var cell = this.state.grid[row][col];
    if(cell.neighbors < 2 || cell.neighbors > 3) {
      cell.isAlive = false;
    } else if(cell.neighbors === 3 && !cell.isAlive) {
      cell.isAlive = true;
    }
  },

  updateAllCells: function() {
    var i, j;
    for(i = 0; i < this.state.size; i++) {
      for(j = 0; j < this.state.size; j++) {
        this.getNeighbors(i, j);
      }
    }
    for(i = 0; i < this.state.size; i++) {
      for(j = 0; j < this.state.size; j++) {
        this.updateCellState(i, j);
      }
    }
  },

  updateGeneration: function() {
    var check = false;

    outerloop:
    for(var i = 0; i < this.state.size; i++) {
      for(var j = 0; j < this.state.size; j++) {
        var cell = this.state.grid[i][j];
        if(cell.isAlive) {
          check = true;
          break outerloop;
        }
      }
    }

    if (check) this.refs.generation.setState({ generation: this.refs.generation.state.generation + 1 });
  },

  renderGrid: function() {
    var delay;
    if(!this.refs.slider) {
      var slider = new Slider()
      delay = slider.state.delay;
    } else {
      delay = this.refs.slider.state.delay;
    }
    this.interval = setInterval(function() {
      this.updateAllCells();
      this.updateGeneration();
      this.forceUpdate();
    }.bind(this), delay);
  },

  render: function() {
    var gridStyle = {
      width: this.state.size * 6,
      height: this.state.size * 6,
    };

    var cells = [];
    for(var i = 0; i < this.state.size; i++) {
      var row = [];
      for(var j = 0; j < this.state.size; j++) {
        var cell = this.state.grid[i][j];
        row.push(<Cell key={i + j} isAlive={cell.isAlive} row={i} col={j} />);
      }
      cells.push(row);
    }

    return (
      <div className="container text-center">
        <h1 id="header">Game of Life</h1>
        <Generation ref="generation" />
        <div id="grid" style={gridStyle}>
          {cells}
        </div>
        <Slider ref="slider" delay={this.value}/>
        <Buttons ref="buttons" pause={this.pause} reset={this.reset} clear={this.clearBoard} />
      </div>
    );
  }
});

export default Grid;
