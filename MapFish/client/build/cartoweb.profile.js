dependencies = {
	layers: [
		{
			name: "../dijit/dijit.js",
			dependencies: [
				"dijit.dijit"
			]
		},
		{
			name: "../cartoweb/cartoweb.js",
			dependencies: [
				"cartoweb.cartoweb"
			]
		}

	],

	prefixes: [
		[ "dijit", "../dijit" ],
		[ "cartoweb", "../cartoweb" ],
	]
}