//import React, { Component } from 'react';
import React from 'react';
import Reflux from 'reflux';
import './App.css';
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


var Cell = createReactClass({
  getInitialState: function() {
    return { isAlive: null };
  },

  componentWillMount: function() {
    this.setState({ isAlive: this.props.isAlive });
  },

  onClick: function() {
    Actions.updateCellStatus(this.props.row, this.props.col);
    this.setState({ isAlive: !this.state.isAlive });
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({ isAlive: nextProps.isAlive });
  },

  render: function() {
    var cellStyle = {
      width: 12,
      height: 12,
      dislay: "inline-block",
      float: "left",
      border: "1px solid #000",
      background: this.state.isAlive ? "#FFF" : "#333"
    };

    return (
      <div onClick={this.onClick} style={cellStyle}></div>
    );
  }
})


var Buttons = createReactClass({
  getInitialState: function() {
    return { text: "Pause" };
  },

  render: function() {
    var margin = { margin: "10px 5px", textAlign: "center" };

    return (
      <div style={margin}>
        <button style={margin} type="button" onClick={this.props.pause} className="btn btn-warning btn-sm sharp">{this.state.text}</button>
        <button style={margin} type="button" onClick={this.props.reset} className="btn btn-warning btn-sm sharp">Reset</button>
        <button style={margin} type="button" onClick={this.props.clear} className="btn btn-warning btn-sm sharp">Clear</button>
      </div>
    );
  }
});


var Generation = createReactClass({
  getInitialState: function() {
    return { generation: 0 };
  },

  render: function() {
    return (
      <h4 id="generation">Generation: {this.state.generation}</h4>
    );
  }
});


var Grid = createReactClass({
  mixins: [Reflux.listenTo(CellStore, "onCellClick")],

  getInitialState: function() {
    return {
      size: 40,
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
    this.refs.buttons.setState({ text: "Start" });
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
    this.interval = setInterval(function() {
      this.updateAllCells();
      this.updateGeneration();
      this.forceUpdate();
    }.bind(this), 1);
  },

  render: function() {
    var gridStyle = {
      width: this.state.size * 14,
      height: this.state.size * 14,
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
        <div id="grid" style={gridStyle}>
          {cells}
        </div>
        <Buttons ref="buttons" pause={this.pause} reset={this.reset} clear={this.clearBoard} />
        <Generation ref="generation" />
      </div>
    );
  }
});

export default Grid;
