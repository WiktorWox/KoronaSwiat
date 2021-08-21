var systemServer = server.registerSystem(0, 0);
var system = systemServer;
var tickNumber = 0;
var playersData = {

};
var isUpdated

//command converter. Use "commandConvert("here your command")" to send command in the world
function commandConvert(command) {
	let commandObject = {
		"__type__" : "event_data",
		"data" : {
			"command" : command
		},
		"__identifier__" : "minecraft:execute_command"
	};

	return system.broadcastEvent("minecraft:execute_command", commandObject);
}

//player health modificator
function healthModificator(symbol, modificator, dataOfPlayer) {
	let playerHealth = system.getComponent(dataOfPlayer, "minecraft:health");
	switch (symbol) {
		case "plus":
			playerHealth.data.max += modificator;
			break;
		case "minus":
			playerHealth.data.max -= modificator;
			break;
		case "multiply":
			playerHealth.data.max *= modificator;
			break;
		case "divide":
			playerHealth.data.max /= modificator;
			break;
	}
	system.applyComponentChanges(dataOfPlayer, playerHealth);
}

systemServer.initialize = function() {
	const scriptLoggerConfig = this.createEventData(
		'minecraft:script_logger_config'
	);
	scriptLoggerConfig.data.log_errors = true;
	scriptLoggerConfig.data.log_information = true;
	scriptLoggerConfig.data.log_warnings = true;
	this.broadcastEvent('minecraft:script_logger_config', scriptLoggerConfig);
	systemServer.log("initialize started");

	//here script listening for time when entity equipped armor
	this.listenForEvent("minecraft:entity_equipped_armor", function(e) {

		//this is where the things needed to perform a function are downloaded
		let armorSlot = e.data.slot;
  		let somethingHappend;
  		let armor = e.data.item_stack.item;
  		let playerId = e.data.entity;
  		let nameComponent = system.getComponent(playerId, "minecraft:nameable");
  		let playerName = nameComponent.data.name;
		let playerTagsData = system.getComponent(playerId, "minecraft:tag");
		let tags = playerTagsData.data;

		//if id of pearson who equipped the armor is not saved in "playersData", that thing doing this
		if (!(playerId in playersData)) {
			playersData[playerId] = {
				"haveSoulHelmet": false,
				"haveSoulChestplate": false,
				"haveSoulLeggings": false,
				"haveSoulBoots": false
			};
		}

		//this is updater of "playersData" based on minecraft tags. When server is shutting down and turning on again things in script are lost but tags in minecraft are saved. In line 64 tags are downloaded
		if (isUpdated !== true) {
			if (tags.indexOf("have_any_piece") !== -1) {
				if (tags.indexOf("have_soul_helmet") !== -1) {
					playersData[playerId].haveSoulHelmet = true;
					healthModificator("plus", 2, playerId);
				}
				if (tags.indexOf("have_soul_chestplate") !== -1) {
					playersData[playerId].haveSoulChestplate = true;
					healthModificator("plus", 2, playerId);
				}
				if (tags.indexOf("have_soul_leggings") !== -1) {
					playersData[playerId].haveSoulLeggings = true;
					healthModificator("plus", 2, playerId);
				}
				if (tags.indexOf("have_soul_boots") !== -1) {
					playersData[playerId].haveSoulBoots = true;
					healthModificator("plus", 2, playerId);
				}
				if (tags.indexOf("have_full_soul_armor") !== -1) {
					playersData[playerId].haveSoulBoots = true;
					healthModificator("plus", 2, playerId);
				}
				isUpdated = true;
			}
		}

		//here, using "switch" is checked armor what entity equipped
  		switch (armor) {
   		    case "korona:soul_helmet":
			    commandConvert("tag " + playerName + " add have_soul_helmet");
			    playersData[playerId].haveSoulHelmet = true;
			    healthModificator("plus", 2, playerId);

	  	 		somethingHappend = true;
	  	 		break;
  		    case "korona:soul_chestplate":
			    commandConvert("tag " + playerName + " add have_soul_chestplate");
			    playersData[playerId].haveSoulChestplate = true;
			    healthModificator("plus", 2, playerId);

	  	 		somethingHappend = true;
	  	 		break;
  		    case "korona:soul_leggings":
			    commandConvert("tag " + playerName + " add have_soul_leggings");
			    playersData[playerId].haveSoulLeggings = true;
			    healthModificator("plus", 2, playerId);

	  	 		somethingHappend = true;
	  	 		break;
  		    case "korona:soul_boots":
			    commandConvert("tag " + playerName + " add have_soul_boots");
			    playersData[playerId].haveSoulBoots = true;
			    healthModificator("plus", 2, playerId);

	  	 		somethingHappend = true;
	  	 		break;
	  	 	case "minecraft:undefined":
	  	 		if (playersData[playerId].haveSoulHelmet == true && armorSlot == "slot.armor.head") {
	  	 			commandConvert("tag " + playerName + " remove have_soul_helmet");
	  	 			playersData[playerId].haveSoulHelmet = false;
	  	 			healthModificator("minus", 2, playerId);

	  	 			somethingHappend = true;
	  	 		}
	  	 		if (playersData[playerId].haveSoulChestplate == true && armorSlot == "slot.armor.chest") {
	  	 			commandConvert("tag " + playerName + " remove have_soul_chestplate");
	  	 			playersData[playerId].haveSoulChestplate = false;
	  	 			healthModificator("minus", 2, playerId);

	  	 			somethingHappend = true;
	  	 		}
	  	 		if (playersData[playerId].haveSoulLeggings == true && armorSlot == "slot.armor.legs") {
	  	 			commandConvert("tag " + playerName + " remove have_soul_leggings");
	  	 			playersData[playerId].haveSoulLeggings = false;
	  	 			healthModificator("minus", 2, playerId);

	  	 			somethingHappend = true;
	  	 		}
	  	 		if (playersData[playerId].haveSoulBoots == true && armorSlot == "slot.armor.feet") {
	  	 			commandConvert("tag " + playerName + " remove have_soul_boots");
	  	 			playersData[playerId].haveSoulBoots = false;
	  	 			healthModificator("minus", 2, playerId);

	  	 			somethingHappend = true;
	  	 		}
	  	 		break;
  		}
  		//What happening if:
	  	if (somethingHappend == true) {
	  		//entity don't have any piece of armor
	  		if (playersData[playerId].haveSoulHelmet == false && playersData[playerId].haveSoulChestplate == false && playersData[playerId].haveSoulLeggings == false && playersData[playerId].haveSoulBoots == false) {
		  	 	commandConvert("tag " + playerName + " remove have_any_piece");
		  	 	somethingHappend = undefined;
		  	} else {
		  		//entity have full armor
		  		if (playersData[playerId].haveSoulHelmet == true && playersData[playerId].haveSoulChestplate == true && playersData[playerId].haveSoulLeggings == true && playersData[playerId].haveSoulBoots == true) {
			  	 	commandConvert("tag " + playerName + " add have_full_soul_armor");
			  	 	healthModificator("plus", 2, playerId);

			  	 	somethingHappend = undefined;
			  	} else {
			  		//entity don't have full armor and before have full armor
			  		if (playersData[playerId].haveSoulHelmet == false && tags.indexOf("have_full_soul_armor") !== -1 || playersData[playerId].haveSoulChestplate == false && tags.indexOf("have_full_soul_armor") !== -1 || playersData[playerId].haveSoulLeggings == false && tags.indexOf("have_full_soul_armor") !== -1 || playersData[playerId].haveSoulBoots == false && tags.indexOf("have_full_soul_armor") !== -1) {
					  	commandConvert("tag " + playerName + " remove have_full_soul_armor");
					  	healthModificator("minus", 2, playerId);

					  	somethingHappend = undefined;
				  	} else {
				  		//entity have one or more piece of armor
				  		if (playersData[playerId].haveSoulHelmet == true || playersData[playerId].haveSoulChestplate == true || playersData[playerId].haveSoulLeggings == true || playersData[playerId].haveSoulBoots == true) {
					  	 	commandConvert("tag " + playerName + " add have_any_piece");
					  	 	somethingHappend = undefined;
					  	}
				  	}
				}
		  	}
	  	}
	});

	this.counter = 0;
	systemServer.log("initialize finished");
};

//5 secunds updater
systemServer.update = function () {
 	this.counter++;
 	if (this.counter === 100) {
 		//every 5 seconds this updater giving effect for entity who have equipped armor
 		commandConvert("effect @a[tag=have_full_soul_armor] speed 5 0 true");
 		commandConvert("effect @a[tag=have_full_soul_armor] strength 5 0 true");
 		this.counter = 0;
 	}
};

//chat event converter from https://wiki.bedrock.dev/scripting/scripting-intro.html
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