import 'polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import { observeProps } from 'rx-recompose'
import Websocket from 'react-websocket'

class ClockDisplay extends React.Component {
	constructor(props) {
		super(props)
		this.state = {}
		this.onTime = this.onTime.bind(this)
	}
	render() {
		return <Websocket url='ws://localhost:3001/time' onMessage={this.onTime}>
			<h1>The time is {this.state.time}</h1>
		</Websocket>
	}

	onTime(data) {
		this.setState({ time: data.time })
	}
}


ReactDOM.render(
	<ClockDisplay />
  , 
  document.getElementById('root'))
