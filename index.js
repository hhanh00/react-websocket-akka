import 'polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import { observeProps, createEventHandler } from 'rx-recompose'
import { Observable } from 'rx'
import Websocket from 'react-websocket'
import RTChart from 'react-rt-chart'
import _ from 'lodash'
import ReconnectingWebSocket from 'reconnecting-websocket'

const AppDisplay = (props) => {
	const rows = _.mapValues(props.data, (v, k) => {
		return <tr key={v}><td>{k}</td><td>{v}</td></tr>
	})
	const data = { 
		date: new Date(),
		random1: props.data.random1 
	}
	const r = _.values(rows)
	return <div>
		<h1>Exported variables</h1>
		<table className='table'>
		<thead>
		<tr><td>Name</td><td>Value</td></tr>
		</thead>
		<tbody>
		{r}
		</tbody>
		</table>
		<h1>Chart</h1>
		<RTChart fields={['random1']} data={data}/>
	</div>
}

const App = observeProps(props$ => {
	const dataEvent = createEventHandler()
	const connect = () => {
		const socket = new WebSocket("ws://localhost:3001/time")
		socket.onopen = e => console.log(e)
		socket.onclose = () => setTimeout(() => connect(), 5000)
		socket.onmessage = event => dataEvent(JSON.parse(event.data))
	}
	connect()
	const data$ = dataEvent.startWith({random1: 0})

	return Observable.combineLatest(props$, data$, (props, data) => _.extend({}, props, {data}))
	})(AppDisplay)
ReactDOM.render(
	<App />
  , 
  document.getElementById('root'))


