var React = require('react');

var TodoList = React.createClass({
	displayName: 'TodoList',

	renderItem(itemText) {
		return (
			<li>
				<input type='checkbox'>
					{itemText}
				</input>
			</li>
		);
	},

	render() {
		return <ul>{this.props.items.map(this.renderItem)}</ul>;
	}
});

var TodoApp = React.createClass({
	displayName: 'TodoApp',

	getInitialState() {
		return {
			items: [],
			text: ''
		};
	},

	handleOnChange(e) {
		this.setState({text: e.target.value});
	},

	handleSubmit(e) {
		e.preventDefault();
		var nextItems = this.state.items.concat([this.state.text]);
		var nextText = '';
		this.setState({
			items: nextItems,
			text: nextText
		});
	},

	render() {
		return (
			<div>
				<h3>TODO</h3>
				<TodoList items={this.state.items} />
				<form onSubmit={this.handleSubmit}>
					<input
						type='text'
						onChange={this.handleOnChange}
						value={this.state.text} />
					<button value={'Add #' + (this.state.items.length + 1)} />
				</form>
			</div>
		);
	}
});

React.render(<TodoApp />, document.getElementById('react-hook'));

