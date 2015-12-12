import 'polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import { observeProps } from 'rx-recompose'
import Websocket from 'react-websocket'
import _ from 'lodash'

class ClockDisplay extends React.Component {
	constructor(props) {
		super(props)
		this.state = {data: {}}
		this.onTime = this.onTime.bind(this)
	}
	render() {
		const rows = _.mapValues(this.state.data, (v, k) => {
			return <tr key={v}><td>{k}</td><td>{v}</td></tr>
		})
		const r = _.values(rows)
		return <Websocket url='ws://localhost:3001/time' onMessage={this.onTime}>
			<h1>Exported variables</h1>
			<table className='table'>
			<thead>
			<tr><td>Name</td><td>Value</td></tr>
			</thead>
			<tbody>
			{r}
			</tbody>
			</table>
		</Websocket>
	}

	onTime(data) {
		this.setState({ data })
	}
}


ReactDOM.render(
	<ClockDisplay />
  , 
  document.getElementById('root'))
