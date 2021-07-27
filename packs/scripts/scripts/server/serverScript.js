var systemServer = server.registerSystem(0, 0);
var system = systemServer;

var tickNumber = 0;

var playersData = {
}


systemServer.initialize = function() {
	const scriptLoggerConfig = this.createEventData(
		'minecraft:script_logger_config'
	)
	scriptLoggerConfig.data.log_errors = true
	scriptLoggerConfig.data.log_information = true
	scriptLoggerConfig.data.log_warnings = true
	this.broadcastEvent('minecraft:script_logger_config', scriptLoggerConfig)
	systemServer.log("initialize started")
  	// this.listenForEvent("minecraft:client_entered_world", (eventData) => this.onClientEnteredWorld(eventData));

	this.listenForEvent("minecraft:entity_equipped_armor", function(e) {
	 // if ("korona:soul_chestplate" == e.item_stack) {
	  		// if (!e.data.entity.id in playersData){
	  		// 	playersData[e.data.entity.id] = {
	  		// 		"soulCheastPlate": false
	  		// 	}
	  		// }
  			// let playerData = playersData[e.data.entity.id]
  			// if (ubrał co){
  		system.log(e)
  			// }

		// }
		let myQuery = system.registerQuery()
		// system.addFilterToQuery(myQuery, "minecraft:name");
		let players = system.getEntitiesFromQuery(myQuery);
		for(var entity in players) {
			system.log(entity)
  		}
	});



	// register event data, register components, register queries, listen for events, . . .

	this.counter = 0
	systemServer.log("initialize finished")
}

// the server runs this update function 20 times per second
systemServer.update = function () {
	// print hello world to the world's chat once per second
	// this.counter++
	// if (this.counter === 20) {
	// 	this.log('Server!')
	// 	this.counter = 0
	// }

 //    // increase the tick number
 //    tickNumber++;

}

// // the server only runs this when the world is shutting down
// systemServer.shutdown = function () {
// 	// clean up stuff . . .
// }

// This is just a helper function that simplifies logging data to the console.
systemServer.log = function (...items) {
	// Convert every parameter into a legible string and collect them into an array.
	const toString = (item) => {
		switch (Object.prototype.toString.call(item)) {
			case '[object Undefined]':
				return 'undefined'
			case '[object Null]':
				return 'null'
			case '[object String]':
				return `"${item}"`
			case '[object Array]':
				const array = item.map(toString)
				return `[${array.join(', ')}]`
			case '[object Object]':
				const object = Object.keys(item).map(
					(key) => `${key}: ${toString(item[key])}`
				)
				return `{${object.join(', ')}}`
			case '[object Function]':
				return item.toString()
			default:
				return item
		}
	}

	// Join the string array items into a single string and print it to the world's chat.
	const chatEvent = this.createEventData('minecraft:display_chat_event')
	chatEvent.data.message = items.map(toString).join(' ')
	this.broadcastEvent('minecraft:display_chat_event', chatEvent)
}



system.onClientEnteredWorld = function(eventData) {
	system.log('entered')
	system.log(eventData)
};