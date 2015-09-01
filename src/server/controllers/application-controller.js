//
// Application Controller
// -----------------------------------------------------------------------------
//
// This is the main controller for our application. Typically it will serve
// up the index page for our single page app to take over from.

// "Models" can be `required` in to your controllers to retrieve data from your
// back end stores

module.exports = {

	index: function(request, reply) {
		return reply.view('index');
	},

	example: function(request, reply) {
		return reply([
			{name: 'frank', age: 42},
			{name: 'sue', age: 44},
			{name: 'jim', age: 25},
			{name: 'joe', age: 35}
		]);
	},

	validationExample: function(request, reply) {
		// We can expect that `request.query.name` will always be there since the
		// validation happens up front in the router
		var filterName = request.query.name;
		var data = [
			{name: 'frank', age: 42},
			{name: 'sue', age: 44},
			{name: 'jim', age: 25},
			{name: 'joe', age: 35}
		];

		reply(data.filter(function(item) {
			return item.name === filterName;
		}));

	}
};

