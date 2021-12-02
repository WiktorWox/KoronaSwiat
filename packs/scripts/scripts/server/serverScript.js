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
let guildGuyIsFounded = false
let victimIsFounded = false
let victimData

function getArrow(angle) {
    angle = angle + 360 * (angle < 0)
    const directions = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
    return directions[Math.round(angle / 45) % 8];
}

function getRelativeAngle(playerAngle, hunterX, hunterZ, targetX, targetZ) {
    let targetAngle = Math.atan2(targetX - hunterX, targetZ - hunterZ) * 180 / Math.PI;
    return -targetAngle - playerAngle;
}

let guildGuyData = {
	"__type__": "entity",
	"__identifier__": "minecraft:npc",
	"id": 2097175,
	"__unique_id__": {
		"64bit_low": 29,
		"64bit_high": -121
	}
}

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
					heartList = heartList.splice(myCounter, 1)
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
			let heartId = Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString()
			heartNameData.data.name = `Serce bazy (` + heartId + `)`
			system.applyComponentChanges(heartData, heartNameData);
			isAnyCuboid = true
  			let heartTags = {
  				"__type__": "component",
  				"__identifier__": "minecraft:tag",
  				"data": []
  			}
  			heartTags.data.push("id-" + heartId)
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

//5 second updater
let delayedFunctions = [];

function delayFunction(funct, ticks){
    delayedFunctions[ticks] = delayedFunctions[ticks] || [];
    delayedFunctions[ticks].push(funct);
}

function callDelayedFunctions(){
	let functions = delayedFunctions.shift();
	if (functions == undefined) return;
	functions.forEach(f => f());
}
function tier(max1, max2, max3, max4, value) {
	let tiers = [`§c·····§7`, `§c····§7·`, `§c···§7··`, `§c··§7···`, `§c·§7····`];
	if (value <= max1) {
		return tiers[0];
	} else if (value <= max2) {
		return tiers[1];
	} else if (value <= max3) {
		return tiers[2];
	} else if (value <= max4) {
		return tiers[3];
	} else {
		return tiers[4];
	}
}

systemServer.update = function () {
    callDelayedFunctions();
    if(this.counter == 0) system.log("working1");
 	if (this.counter % 5 == 0){
 		let tagQuery = system.registerQuery();
		system.addFilterToQuery(tagQuery, "minecraft:tag");
		let entitiesWithTags = system.getEntitiesFromQuery(tagQuery);
		for (var myCounter = 0; myCounter < entitiesWithTags.length; myCounter++) {
			let entityTags = system.getComponent(entitiesWithTags[myCounter], "minecraft:tag").data;
			for (var myCounter2 = 0; myCounter2 < entityTags.length; myCounter2++) {
				let splitedEntityTags = entityTags[myCounter2].split("-")
				if (splitedEntityTags[0] == "tag_event") {
					let npcTag
					let playerName
					let mode = null
					//Here you can add events based on minecraft tags. E.g. you adding to entity tag "tag_event-remove_trading" and then in this entity trading is removed
					switch (splitedEntityTags[1]) {
						case "remove_trading":
							for (var myCounter3 = 0; myCounter3 < entityTags.length; myCounter3++) {
								if (entityTags[myCounter3].split("_")[0] == "npc") {
									npcTag = entityTags[myCounter3]
								}
							}
							delayFunction(()=>{
								commandConvert("event entity @e[tag=" + npcTag + "] korona:add_npc");
							}, 20 * 5 )
							mode = "npcTag"
							break;
						case "using_scroll":
							system.log("used_scroll")
							mode = "playerName";
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							if (guildGuyIsFounded == true) {
								let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag")
								let playersGuildNumber = 0
								for (var myCounter4 = 0; myCounter4 < guildGuyTags.data.length; myCounter4++) {
									let splitedTags = guildGuyTags.data[myCounter4].split('-')
									if (splitedTags[0] == "guild" && splitedTags[1] == playerName) {
										system.log("yes");
										playersGuildNumber += 1
									}
								}
								system.log('gracz posiada ' + playersGuildNumber + ' gildii');
								if (playersGuildNumber < 6) {
									let guildId = Math.floor(Math.random()*(999999 - 100000 + 1)) + 100000
									commandConvert("tag @e[tag=npc_yalio] add guild-" + playerName + '-no-' + guildId);
									commandConvert("clear " + playerName + " korona:unsealed_guild_scroll 0 1");
									commandConvert("give " + playerName + " korona:guild_scroll");
									commandConvert("give " + playerName + " korona:heart_of_base_item");
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§7 Stworzyłeś gildię o identifikatorze ' + guildId + '. Aby ją aktywować użyj komendy: !guild activate [identifikator gildii] [nazwa gildii] [prefiks gildii]"}]}')
								} else {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cMożesz posiadać maksymalnie 5 gildii. Aby stworzyć nową, usuń inną używając komendy: §7!guild remove [nazwa gildii lub identifikator]"}]}')
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono §7Yalio (Dyplomaty) §c. Podejź do niego, aby serwer mógł zapisać jego dane"}]}')
							}
							break;
						case "using_horn":
							mode = "playerName";
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							let playerPosition = system.getComponent(entitiesWithTags[myCounter], "minecraft:position").data;
							let victimPosition = system.getComponent(victimData, "minecraft:position").data;
							let playerRotation = system.getComponent(entitiesWithTags[myCounter], "minecraft:rotation").data;
							let distance = Math.round(Math.sqrt(Math.pow(Math.abs(victimPosition.x - playerPosition.x), 2) + Math.pow(Math.abs(victimPosition.z - playerPosition.z), 2)))
							commandConvert('title ' + playerName + ' actionbar ' + tier(5, 35, 85, 200, distance) + ' §2' + distance + `m §6` + getArrow(getRelativeAngle(playerRotation.y, playerPosition.x, playerPosition.z, victimPosition.x, victimPosition.z)));

							break;
						case "list_guilds":
							let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag").data
							mode = "playerName";
							let playerGuilds = []
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							for (var myCounter4 = 0; myCounter4 < guildGuyTags.length; myCounter4++) {
								let splitedTag = guildGuyTags[myCounter4].split('-')
								if (splitedTag[0] == 'guild' && splitedTag[1] == playerName){
									if (splitedTag[2] == "yes") {
										playerGuilds.push(' §c[§6aktywne: §ftak, §6nazwa: §f' + splitedTag[3] + ', §6prefiks: §f' + splitedTag[4] + ', §6gracze: §f' + splitedTag[5] + ' §6kuboidy: §f' + splitedTag[6] + '§c]')
									} else if (splitedTag[2] == "no") {
										playerGuilds.push(' §c[§6aktywne: §fnie, §6id: §f' + splitedTag[3] + '§c]')
									}
								}
							}
							if (playerGuilds.length !== 0) {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "Posiadasz następujące gildie: ' + playerGuilds + '"}]}')
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "Nie posiadasz żadnych gildii"}]}')
							}
							break;
						case "activate_guild":
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							mode = "playerName";
							if (guildGuyIsFounded == true) {
								let activatedGuild = undefined
								let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag");
								let duplicatedGuild = false
								for (var myCounter5 = 0; myCounter5 < guildGuyTags.data.length; myCounter5++) {
									let splitedTag = guildGuyTags.data[myCounter5].split('-');
									if (splitedTag[0] == `guild`) {
										if (splitedTag[3] == splitedEntityTags[3] || splitedTag[4] == splitedEntityTags[4]) {
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cGildia o podanej nazwie lub prefiksie już istnieje. Prosimy o ich zmianę"}]}')
											duplicatedGuild = true
										}
									}
								}
								if (duplicatedGuild == false) {
									for (var myCounter5 = 0; myCounter5 < guildGuyTags.data.length; myCounter5++) {
										let splitedTag = guildGuyTags.data[myCounter5].split('-');
										if (activatedGuild !== true) {
											if (splitedTag[0] == `guild` && splitedTag[1] == playerName && splitedTag[2] == `no` && splitedTag[3] == splitedEntityTags[2]) {
												guildGuyTags.data[myCounter5] = `guild-` + playerName + `-yes-` + splitedEntityTags[3] + `-` + splitedEntityTags[4] + `-` + playerName + `-brak`
												system.applyComponentChanges(guildGuyData, guildGuyTags)
												activatedGuild = true
												commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "Aktywowano gildię. Nazywa się ona teraz §6' + splitedEntityTags[3] + '§f i posiada prefiks §6' + splitedEntityTags[4] + '"}]}')
											} else {
												activatedGuild = false
											}
										}
									}
								}
								if (activatedGuild == false) {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono gildii o podanym identyfikatorze (guild activate >>' + splitedEntityTags[2] + '<<)"}]}')
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono §7Yalio (Dyplomaty) §c. Podejź do niego, aby serwer mógł zapisać jego dane"}]}')
							}
							break;
						case "remove_guild":
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							mode = "playerName";
							if (guildGuyIsFounded == true) {
								let guildIsFound = false
								let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag");
								for (var myCounter5 = 0; myCounter5 < guildGuyTags.data.length; myCounter5++) {
									let splitedTag = guildGuyTags.data[myCounter5].split('-');
									if (splitedTag[0] == `guild` && splitedTag[1] == playerName && splitedTag[3] == splitedEntityTags[2]) {
										guildIsFound = true;
										if (splitedTag[2] == "yes") {
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "Usunięto gildię o nazwie §6' + splitedTag[3] + '§f[§6' + splitedTag[4] + '§f] i nie jest ona teraz przypisana do serc bazy: §6' + splitedTag[6] + '"}]}')
										} else if (splitedTag[2] == "no") {
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "Usunięto gildię o identyfikatorze §6' + splitedTag[3] + '"}]}')
										}
										guildGuyTags.data.splice(myCounter5, 1)
										system.applyComponentChanges(guildGuyData, guildGuyTags)
									}
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono §7Yalio (Dyplomaty) §c. Podejź do niego, aby serwer mógł zapisać jego dane"}]}')
							}
							break;
						case "assign_guild":
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							mode = "playerName";
							if (guildGuyIsFounded == true) {
								let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag");
								let foundedCuboid = undefined;
								let guildIsFounded = false;
								system.log(`siema`)
								//----TO FINISH. NOT END YET {
								for (var myCounter5 = 0; myCounter5 < heartList.length; myCounter5++) {
									if (heartList[myCounter5].id == splitedEntityTags[3] && `guild_scroll` in heartList[myCounter5].upgrades) {
										if (heartList[myCounter5].owner == playerName) {
											foundedCuboidNumber = myCounter5
										} else {
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie jesteś właścicielem wprowadzonego serca bazy"}]}');
											foundedCuboid = false
										}
									}
								}
								if (foundedCuboid !== undefined && foundedCuboid !== false) {
									for (var myCounter5 = 0; myCounter5 < guildGuyTags.length; myCounter5++) {
										let splitedTag = guildGuyTags.data[myCounter5].split('-');
										if (splitedTag[0] == `guild` && splitedTag[3] == splitedEntityTags[2]) {
											if (splitedTag[2] == `no`) {
												if (splitedTag[1] == playerName) {
													system.log(`działa!`)
												} else {
													commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie jesteś właścicielem wprowadzonej gildii"}]}')
												}
											} else {
												commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cGildia musi być aktywna"}]}')
											}
										}
									}
								} else if (foundedCuboid !== false) {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono wprowadzonego serca bazy. Pamiętaj, że serce bazy musi mieć włożony zwój gildii, aby przypisać do niego gildię"}]}')
								}
								//----}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono §7Yalio (Dyplomaty) §c. Podejź do niego, aby serwer mógł zapisać jego dane"}]}')
							}
							break;
					}
					switch (mode) {
						case "playerName":
							commandConvert("tag @e[name=" + playerName + "] remove " + entityTags[myCounter2]);
							break;
						case "npcTag":
							commandConvert("tag @e[tag=" + npcTag + "] remove " + entityTags[myCounter2]);
							break;
					}
				} else if (splitedEntityTags[0] == "npc_yalio" && guildGuyIsFounded !== true) {
					guildGuyData = entitiesWithTags[myCounter]
					guildGuyIsFounded = true
				} else if (splitedEntityTags[0] == "victim" && victimIsFounded !== true) {
					victimData = entitiesWithTags[myCounter];
					victimIsFounded = true;
				}
			}
		}
 	}

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
	if (this.counter % 5 == 0){
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
				let isGuildScroll = false
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
						case `korona:guild_scroll`:
							isGuildScroll = true
							if (!(`upgrade-guild_scroll` in heartTags.data)) {
								newHeartData.upgrades.push(`guild_scroll`);
								heartTags.data.push(`upgrade-guild_scroll`);
								system.applyComponentChanges(entitiesWithInventory[myCounter], heartTags)
							}
							break;
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
				if (isGuildScroll == false && `upgrade-guild_scroll` in heartTags.data) {
					for (var tagCounter = 0; tagCounter < heartTags.data.length; tagCounter++) {
						if (heartTags.data[tagCounter] == `upgrade-guild_scroll`) {
							heartTags.data.splice(tagCounter, 1)
							system.applyComponentChanges(entitiesWithInventory[myCounter], heartTags)
						}
					}
				}
				if (isInHeartList == false) {
					heartList.push(newHeartData);
				}
			}
		}
	}

 	if (this.counter === 100) {

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