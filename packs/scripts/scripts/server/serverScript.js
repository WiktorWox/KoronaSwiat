var systemServer = server.registerSystem(0, 0);
var system = systemServer;
var tickNumber = 0;
var playersData = {
};
var countOfPlayers = 0;
var playersNameList = [];
let isAnyCuboid = false
let time = 0
let heartData
let heartList = []

function tagConverter (tagData) {
	let returnData = {
		"id": null,
		"name": null,
		"owner": null,
		"tier": null,
		"players": [],
		"upgrades": []
	}
	let playerTags = tagData
	for (var myCounter = 0; myCounter < playerTags.length; myCounter++) {
		switch (playerTags[myCounter].split("-")[0]) {
			case "player":
				let playerName = playerTags[myCounter].split("-")[1];
				if (playerTags[myCounter].split("-")[1] == "owner") {
					playerName = playerTags[myCounter].split("-")[2];
					returnData.owner = playerName;
				}
				returnData.players.push(playerName);
				break;
			case "tier":
				returnData.tier = playerTags[myCounter].split("-")[1];
				break;
			case "upgrade":
				returnData.upgrades.push(playerTags[myCounter].split("-")[1]);
				break;
			case "name":
				returnData.name = playerTags[myCounter].split("-")[1];
				break;
			case "id":
				returnData.id = playerTags[myCounter].split("-")[1];
				break;
		}
	}
	return (returnData)
}

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
	system.listenForEvent("korona:isAnyHeart", function(heartEvent) {
		isAnyCuboid = true
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

	this.listenForEvent("minecraft:entity_death", function(deathData) {
		if (deathData.data.entity.__identifier__ == "korona:heart_of_base") {
			let heartTagsData = tagConverter(system.getComponent(deathData.data.entity, "minecraft:tag").data);
			let message
			if (heartTagsData.name !== null) {
				message = '§cSerce bazy gildii "§6' + heartTagsData.name + '§c" zostało zniszczone!'
			} else if (heartTagsData.players.length > 1) {
				message = '§cSerce bazy twojej gildii (Której właścicielem jest §6' + heartTagsData.owner + '§c) zostało zniszczone!'
			} else {
				message = '§cTwoje serce bazy zostało zniszczone!'
			}
			let heartPosition = system.getComponent(deathData.data.entity, "minecraft:position").data

			for (var myCounter = 0; myCounter < heartTagsData.players.length; myCounter++) {
				commandConvert('tellraw ' + heartTagsData.players[myCounter] + ' {"rawtext":[{"text": "' + message + '"}]}')
			}
			if (heartTagsData.tier == 0) {
				commandConvert('execute @r ' + heartPosition.x + ' ' + heartPosition.y + ' ' + heartPosition.z + ' gamemode s @a[r=10, tag=!admin_mode, m=adventure]');
			} else if (heartTagsData.tier == 1) {
				commandConvert('execute @r ' + heartPosition.x + ' ' + heartPosition.y + ' ' + heartPosition.z + ' gamemode s @a[r=10, tag=!admin_mode, m=adventure]');
			} else if (heartTagsData.tier == 2) {
				commandConvert('execute @r ' + heartPosition.x + ' ' + heartPosition.y + ' ' + heartPosition.z + ' gamemode s @a[r=10, tag=!admin_mode, m=adventure]');
			} else if (heartTagsData.tier == 3) {
				commandConvert('execute @r ' + heartPosition.x + ' ' + heartPosition.y + ' ' + heartPosition.z + ' gamemode s @a[r=10, tag=!admin_mode, m=adventure]');
			}
			for (var myCounter = 0; myCounter < heartList.length; myCounter++) {
				if (heartList[myCounter].id == heartTagsData.id) {
					heartList.splice(myCounter, 1)
				}
			}
		}
	})

	this.listenForEvent("minecraft:entity_created", function(spawningData) {
  		if (spawningData.data.entity.__identifier__ == "korona:heart_of_base") {
  			heartData = spawningData.data.entity;
  		}
	});
  	system.listenForEvent("minecraft:entity_use_item", function(usingItemData) {
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
  			heartTags.data.push("id-" + Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString())
  			heartTags.data.unshift("tier-0");
  			heartTags.data.push("player-owner-" + playerName);
  			if (system.hasComponent(heartData, "minecraft:tag")) {
  				system.applyComponentChanges(heartData, heartTags);
  			} else {
  				system.createComponent(heartTags, "minecraft:tag");
  			}
  			heartList.push(tagConverter(heartTags.data));
		}
	});

	this.counter = 0;
	systemServer.log("initialize finished");
};
systemServer.update = function () {
 	this.counter++;
	if (isAnyCuboid == true) {
		for (var myCounter = 0; myCounter < heartList.length; myCounter++) {
			commandConvert("execute @e[type=korona:heart_of_base, tag=tier-0] ~ ~ ~ gamemode a @a[rm=8, r=10, tag=!admin_mode, m=survival, name=!" + heartList[myCounter].players.toString().replace(/,/g, ', name!=') + "]");
			commandConvert("execute @e[type=korona:heart_of_base, tag=tier-0] ~ ~ ~ gamemode s @a[rm=10, r=11, tag=!admin_mode, m=adventure, name=!" + heartList[myCounter].players.toString().replace(/,/g, ', name!=') + "]");
			commandConvert("execute @e[type=korona:heart_of_base, tag=tier-1] ~ ~ ~ gamemode a @a[rm=13, r=15, tag=!admin_mode, m=survival, name=!" + heartList[myCounter].players.toString().replace(/,/g, ', name!=') + "]");
			commandConvert("execute @e[type=korona:heart_of_base, tag=tier-1] ~ ~ ~ gamemode s @a[rm=15, r=16, tag=!admin_mode, m=adventure, name=!" + heartList[myCounter].players.toString().replace(/,/g, ', name!=') + "]");
			commandConvert("execute @e[type=korona:heart_of_base, tag=tier-2] ~ ~ ~ gamemode a @a[rm=17, r=19, tag=!admin_mode, m=survival, name=!" + heartList[myCounter].players.toString().replace(/,/g, ', name!=') + "]");
			commandConvert("execute @e[type=korona:heart_of_base, tag=tier-2] ~ ~ ~ gamemode s @a[rm=19, r=20, tag=!admin_mode, m=adventure, name=!" + heartList[myCounter].players.toString().replace(/,/g, ', name!=') + "]");
			commandConvert("execute @e[type=korona:heart_of_base, tag=tier-3] ~ ~ ~ gamemode a @a[rm=20, r=22, tag=!admin_mode, m=survival, name=!" + heartList[myCounter].players.toString().replace(/,/g, ', name!=') + "]");
			commandConvert("execute @e[type=korona:heart_of_base, tag=tier-3] ~ ~ ~ gamemode s @a[rm=22, r=23, tag=!admin_mode, m=adventure, name=!" + heartList[myCounter].players.toString().replace(/,/g, ', name!=') + "]");
		}
	}
	let heartQuery = system.registerQuery();
	system.addFilterToQuery(heartQuery, "minecraft:inventory");
	let entitiesWithInventory = system.getEntitiesFromQuery(heartQuery);
	for (var myCounter = 0; myCounter < entitiesWithInventory.length; myCounter++) {
		if (entitiesWithInventory[myCounter].__identifier__ == "korona:heart_of_base") {
			let isInHeartList = false
			let newHeartData = tagConverter(system.getComponent(entitiesWithInventory[myCounter], "minecraft:tag").data);
			isAnyCuboid = true
			let heartInventoryData = system.getComponent(entitiesWithInventory[myCounter], "minecraft:inventory_container");
			let heartTags = system.getComponent(entitiesWithInventory[myCounter], "minecraft:tag")
			let isBlueRune = false
			let isRedRune = false
			let isPurpleRune = false
			for (var inventoryCounter = 0; inventoryCounter < heartInventoryData.data.length; inventoryCounter++) {
				//Here add some heart upgrading items (e.g. "guild scroll")
				switch (heartInventoryData.data[inventoryCounter].__identifier__) {
					case "korona:blue_energy_rune":
						if (newHeartData.tier < 1) {
							newHeartData.tier = 1
							for (var playerCounter = 0; playerCounter < newHeartData.players.length; playerCounter++) {
								commandConvert('tellraw ' + newHeartData.players[playerCounter] + ' {"rawtext":[{"text": "§7Twoje serce bazy ma teraz zasięg 15 bloków (31x31)"}]}')
							}
						}
						isBlueRune = true
						break
					case "korona:red_energy_rune":
						if (newHeartData.tier < 2) {
							newHeartData.tier = 2
							for (var playerCounter = 0; playerCounter < newHeartData.players.length; playerCounter++) {
								commandConvert('tellraw ' + newHeartData.players[playerCounter] + ' {"rawtext":[{"text": "§7Twoje serce bazy ma teraz zasięg 19 bloków (39x39)"}]}')
							}
						}
						isRedRune = true
						break
					case "korona:purple_energy_rune":
						if (newHeartData.tier < 3) {
							newHeartData.tier = 3
							for (var playerCounter = 0; playerCounter < newHeartData.players.length; playerCounter++) {
								commandConvert('tellraw ' + newHeartData.players[playerCounter] + ' {"rawtext":[{"text": "§7Twoje serce bazy ma teraz zasięg 22 bloków (45x45). Jest to maksymalny zasięg"}]}')
							}
						}
						isPurpleRune = true
						break
				}
			}
			if (isBlueRune == false && isRedRune == false && isPurpleRune == false) {
				if (newHeartData.tier != 0) {
					for (var playerCounter = 0; playerCounter < newHeartData.players.length; playerCounter++) {
						commandConvert('tellraw ' + newHeartData.players[playerCounter] + ' {"rawtext":[{"text": "§7Twoje serce bazy ma teraz zasięg 10 bloków (21x21). Jest to minimalny zasięg"}]}')
					}
				}
				newHeartData.tier = 0
			} else if (isBlueRune == true && isRedRune == false && isPurpleRune == false) {
				newHeartData.tier = 1
			} else if (isRedRune == true && isPurpleRune == false) {
				newHeartData.tier = 2
			}
			for (var tagCounter = 0; tagCounter < heartTags.data.length; tagCounter++) {
				if (heartTags.data[tagCounter].split("-")[0] == "tier") {
					heartTags.data.splice(tagCounter, 1, "tier-" + newHeartData.tier.toString())
					system.applyComponentChanges(entitiesWithInventory[myCounter], heartTags)
				}
			}
			for (var myCounter2 = 0; myCounter2 < heartList.length; myCounter2++) {
				if (heartList[myCounter2].id == newHeartData.id) {
					isInHeartList = true
				}
			}
			if (isInHeartList == false) {
				heartList.push(newHeartData);
			}
		}
	}

 	if (this.counter === 100) {
		time++

 		system.log("working")
 		//every 5 seconds this updater giving effect for entity who have equipped armor

 		//Make ERROR - to rapair//

 		// commandConvert("effect @a[tag=have_full_soul_armor] speed 5 0 true");
 		// commandConvert("effect @a[tag=have_full_soul_armor] strength 5 0 true");
 		// for (var myCounter = 0; myCounter < countOfPlayers; myCounter++) {
 		// 	let playerId = playersNameList[myCounter];
	  	// 		let nameComponent = system.getComponent(playerId, "minecraft:nameable");
	  	// 		let playerName = nameComponent.data.name;
			// let inHandItems = system.getComponent(playerId, "minecraft:hand_container");
			// if (inHandItems.data[0].item == "korona:soul_pickaxe" && playersData[playerId].haveSoulPickaxe == true) {
			// 	commandConvert("effect " + playerName + " haste 5 3 true");
			// }
	 	// 	if (playersData[playerId].haveSoulPickaxe == true) {
	 	// 		playersData[playerId].speedDiggingTime++;
	 	// 		if (playersData[playerId].speedDiggingTime > 83) {
	 	// 			playersData[playerId].haveSoulPickaxe = false;
	 	// 			playersData[playerId].speedDiggingTime = 0;
	 	// 			commandConvert("title " + playerName + " actionbar Szybkie kopanie się skończyło!");
	 	// 		}
 		// 	}
 		// }
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