var systemServer = server.registerSystem(0, 0);
var system = systemServer;
var tickNumber = 0;
var playersData = {
};
var countOfPlayers = 0;
var playersNameList = [];

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
				"haveSoulBoots": false,
				"haveSoulPickaxe": false,
				"speedDiggingTime": 0
			};
			countOfPlayers++;
			playersNameList.push(playerId);
		}

		//this is updater of "playersData" based on minecraft tags. When server is shutting down and turning on again things in script are lost but tags in minecraft are saved. In line 64 tags are downloaded
		if (playersData[playerId].isUpdated !== true) {
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
			}
			playersData[playerId].isUpdated = true;
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
	system.listenForEvent("minecraft:player_destroyed_block", function(dataOfEvent) {
		let playerId = dataOfEvent.data.player;
  		let nameComponent = system.getComponent(playerId, "minecraft:nameable");
  		let playerName = nameComponent.data.name;
		let inHandItems = system.getComponent(playerId, "minecraft:hand_container");
		let playerPosition = system.getComponent(playerId, "minecraft:position");
		if (!(playerId in playersData)) {
			playersData[playerId] = {
				"haveSoulHelmet": false,
				"haveSoulChestplate": false,
				"haveSoulLeggings": false,
				"haveSoulBoots": false,
				"haveSoulPickaxe": false,
				"speedDiggingTime": 0
			};
			countOfPlayers++;
			playersNameList.push(playerId);
		}
		if (inHandItems.data[0].item == "korona:soul_pickaxe" && inHandItems.data[1].item == "korona:soul" && playersData[playerId].haveSoulPickaxe !== true && inHandItems.data[1].count > 2) {
			playersData[playerId].haveSoulPickaxe = true;
			inHandItems.data[1].count -= 3;
			if (inHandItems.data[1].count < 1) {
				commandConvert("replaceitem entity " + playerName + " slot.weapon.offhand 0 minecraft:air");
			} else {
				commandConvert("replaceitem entity " + playerName + " slot.weapon.offhand 0 korona:soul " + inHandItems.data[1].count);
			}	
			commandConvert("title " + playerName + " actionbar Kilof dusz jest naładowany!");
			system.broadcastEvent("minecraft:play_sound", {
				"__type__" : "event_data",
				"data" : {
					"pith" : 1.0,
					"position": [playerPosition.data.x, playerPosition.data.y, playerPosition.data.z],
					"sound": "korona.soul_pickaxe_power",
					"volume": 1.0
				},
				"__identifier__" : "minecraft:play_sound"
			});
		}
	});

	system.listenForEvent("minecraft:entity_death", function(deathData) {
		if (deathData.data.killer.__identifier__ == "minecraft:player" && deathData.data.entity.__identifier__ == "minecraft:player") {
			let killerName = system.getComponent(deathData.data.killer, "minecraft:nameable").data.name;
			let entityName = system.getComponent(deathData.data.entity, "minecraft:nameable").data.name;
			let itemInHand = system.getComponent(deathData.data.killer, "minecraft:hand_container").data[0];
			let message
			switch (deathData.data.cause) {
				case "entity_attack":
					message = `Gracz §c` + killerName + `§r zadźgał gracza §c` + entityName + `§r za pomocą przedmiotu §6` + itemInHand.item
					break;
				case "magic":
					message = `Gracz §c` + killerName + `§r użył magii aby zabić gracza §c` + entityName + `§r używając przy tym przedmiotu §6` + itemInHand.item
					break;
				case "projectile":
					message = `Gracz §c` + entityName + `§r został zastrzelony przez gracza §c` + killerName + `§r z §6` + itemInHand.item + `§r i użył jako pocisku §6` + deathData.data.projectile_type
					break;
				default:
					system.log("coś nie tak")
			}
			commandConvert(`tellraw @a {"rawtext":[{"text":"[§l§6Hunting Day log§r] ` + message + `"}]}`);
			commandConvert(`scoreboard players add ` + killerName + ` kills 1`)
			commandConvert(`scoreboard players add "§6Wszystkie zabójstwa " kills 1`)
			commandConvert(`give ` + killerName + ` korona:players_head`)
		}
	});
	this.counter = 0;
	systemServer.log("initialize finished");
};

//5 second updater
systemServer.update = function () {
 	this.counter++;
 	if (this.counter === 100) {
 		//every 5 seconds this updater giving effect for entity who have equipped armor
 		commandConvert("effect @a[tag=have_full_soul_armor] speed 5 0 true");
 		commandConvert("effect @a[tag=have_full_soul_armor] strength 5 0 true");
 		for (var myCounter = 0; myCounter < countOfPlayers; myCounter++) {
 			let playerId = playersNameList[myCounter];
	  		let nameComponent = system.getComponent(playerId, "minecraft:nameable");
	  		let playerName = nameComponent.data.name;
			let inHandItems = system.getComponent(playerId, "minecraft:hand_container");
			if (inHandItems.data[0].item == "korona:soul_pickaxe" && playersData[playerId].haveSoulPickaxe == true) {
				commandConvert("effect " + playerName + " haste 5 3 true");
			}
	 		if (playersData[playerId].haveSoulPickaxe == true) {
	 			playersData[playerId].speedDiggingTime++;
	 			if (playersData[playerId].speedDiggingTime > 83) {
	 				playersData[playerId].haveSoulPickaxe = false;
	 				playersData[playerId].speedDiggingTime = 0;
	 				commandConvert("title " + playerName + " actionbar Szybkie kopanie się skończyło!");
	 			}
 			}
 		}
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