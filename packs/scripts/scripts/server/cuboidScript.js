var systemServer = server.registerSystem(0, 0);
var system = systemServer;
var tickNumber = 0;

var cuboid1Range = 10;

systemServer.initialize = function() {
    let globals = system.registerQuery();
	const scriptLoggerConfig = this.createEventData(
		'minecraft:script_logger_config'
	);
	scriptLoggerConfig.data.log_errors = true;
	scriptLoggerConfig.data.log_information = true;
	scriptLoggerConfig.data.log_warnings = true;
	this.broadcastEvent('minecraft:script_logger_config', scriptLoggerConfig);

	this.listenForEvent("minecraft:player_placed_block", function(e) {
		let playerId = e.data.player;
		let nameComponent = system.getComponent(playerId, "minecraft:nameable");
  		let playerName = nameComponent.data.name;
		let blockPosition = e.data.block_position
		let cuboidPosition = {
			"block_position": blockPosition,
			"cuboid_position": {
				"x": blockPosition.x + cuboid1Range,
				"y": blockPosition.y + cuboid1Range,
				"z": blockPosition.z + cuboid1Range,
				"secondX": blockPosition.x - cuboid1Range,
				"secondY": blockPosition.y - cuboid1Range,
				"secondZ": blockPosition.z - cuboid1Range
			}
		}
		// let test = system.registerQuery();
		// system.addFilterToQuery(test, "minecraft:scaffolding_climber");
		// system.log(system.getEntitiesFromQuery(test));
	    system.addFilterToQuery(globals, nameComponent);
	    let physics = system.getEntitiesFromQuery(globals);
	    system.log(physics)
	});
}

systemServer.log = function (...items) {
	const toString = (item) => {
		switch (Object.prototype.toString.call(item)) {
			case '[object Undefined]':
				return 'undefined';
			case '[object Null]':
				return 'null';
			case '[object String]':
				return `"${item}"`;
			case '[object Array]':
				const array = item.map(toString);
				return `[${array.join(', ')}]`;
			case '[object Object]':
				const object = Object.keys(item).map(
					(key) => `${key}: ${toString(item[key])}`
				);
				return `{${object.join(', ')}}`;
			case '[object Function]':
				return item.toString();
			default:
				return item;
		}
	};

	const chatEvent = this.createEventData('minecraft:display_chat_event');
	chatEvent.data.message = items.map(toString).join(' ');
	this.broadcastEvent('minecraft:display_chat_event', chatEvent);
};



system.onClientEnteredWorld = function(eventData) {
	system.log('entered');
	system.log(eventData);
};