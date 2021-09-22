var systemServer = server.registerSystem(0, 0);
var system = systemServer;
var tickNumber = 0;
var isAnyCuboid = false

var cuboid1Range = 10;
let heartData

systemServer.initialize = function() {
	let heartQuery = system.registerQuery();
	let countOfHearts = 0
	system.addFilterToQuery(heartQuery, "minecraft:inventory");
	entitiesWithInventory = system.getEntitiesFromQuery(heartQuery);
	system.log(entitiesWithInventory)
	for (var myCounter = 0; myCounter < entitiesWithInventory.length; myCounter++) {
		if (entitiesWithInventory[myCounter].__identifier__ == "korona:heart_of_base") {
			countOfHearts++
		}
	}

    let globals = system.registerQuery();
	const scriptLoggerConfig = this.createEventData(
		'minecraft:script_logger_config'
	);
	scriptLoggerConfig.data.log_errors = true;
	scriptLoggerConfig.data.log_information = true;
	scriptLoggerConfig.data.log_warnings = true;
	this.broadcastEvent('minecraft:script_logger_config', scriptLoggerConfig);

	this.listenForEvent("minecraft:entity_created", function(spawningData) {
  		if (spawningData.data.entity.__identifier__ == "korona:heart_of_base") {
  			heartData = spawningData.data.entity;
  		}
  		system.listenForEvent("minecraft:entity_use_item", function(usingItemData) {
  			system.log(usingItemData.data)
			if (usingItemData.data.item_stack.__identifier__ == "korona:heart_of_base_item") {
				let playerData = usingItemData.data.entity
				let playerName = system.getComponent(playerData, "minecraft:nameable").data.name;
				let heartNameData = system.getComponent(heartData, "minecraft:nameable");
				heartNameData.data.name = "Serce bazy gracza " + playerName;
				system.applyComponentChanges(heartData, heartNameData);

				isAnyCuboid = true
  				let heartTags = {
  					"__type__": "component",
  					"__identifier__": "minecraft:tag",
  					"data": []
  				}
  				heartTags.data.unshift("tier-0");
  				heartTags.data.push("player-owner-" + playerName);
  				if (system.hasComponent(heartData, "minecraft:tag")) {
  					system.applyComponentChanges(heartData, heartTags);
  				} else {
  					system.createComponent(heartTags, "minecraft:tag");
  				}
			}
		});
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