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
let adminModeData = []
let classItemData = null

function updatePlayers(players, numberInList) {
	heartList[numberInList].players = players
	for (var myCounter = 0; myCounter < players.length; myCounter++) {
		if (players[myCounter] !== heartList[numberInList].owner) {
			commandConvert('tag @e[type=korona:heart_of_base, tag=id-' + heartList[numberInList].id + '] add player-' + players[myCounter]);
		}
	}
}

function itemConvert(identifier, count) {
	let returnData = {
		"__type__": "item_stack",
		"__identifier__": identifier,
		"count": count,
		"item": identifier
	}
	return returnData;
}

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
		"guilds": null,
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
			case "guild":
				returnData.guilds = playerTags[myCounter].split("-")[1];
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

function showAchievement(targetId, archivementTitle, archivementText, archivementId) {
	let targetTags = system.getComponent(targetId, "minecraft:tag").data;
	let isArch = false;
	let archTag = 'arch-' + archivementId;
	for (var a = 0; a < targetTags.length; a++) {
		if (targetTags[a] == archTag) {
			isArch = true;
		}
	}
	if (isArch == false) {
		let targetName = system.getComponent(targetId, "minecraft:nameable").data.name;
		commandConvert('tellraw ' + targetName + ' {"rawtext":[{"text": "::==::==::==::==::==::\nZdobyłeś osiągnięcie §a[§l' + archivementTitle + '§r§a]§r! \n§7' + archivementText + '\n§r::==::==::==::==::==::"}]}');
		commandConvert('tellraw @a[name=!' + targetName + '] {"rawtext":[{"text": "::==::==::==::==::==::\nGracz ' + targetName + ' zdobył osiągnięcie §a[§l' + archivementTitle + '§r§a]§r! \n§7' + archivementText + '\n§r::==::==::==::==::==::"}]}');
		commandConvert('playsound ui.archivement ' + targetName);
		commandConvert('tag ' + targetName + ' add ' + archTag);
	}
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

	this.listenForEvent("minecraft:entity_created", function(spawningData) {
		let entityIdentifier = spawningData.data.entity.__identifier__;
  		if (entityIdentifier == "korona:heart_of_base") {
  			heartData = spawningData.data.entity;
  		}
  		if (entityIdentifier == 'korona:paladins_sword' || entityIdentifier == 'korona:tool_table' || entityIdentifier == 'korona:lute_strenght' || entityIdentifier == 'korona:lute_speed' || entityIdentifier == 'korona:lute_haste') {
  			classItemData = spawningData.data.entity
  		}
	});

	this.listenForEvent("minecraft:block_destruction_started", function(destructionData) {
		let handContainer = system.getComponent(destructionData.data.player, "minecraft:hand_container");
  		if (handContainer.data[0].item == "korona:lava_sword" && system.getBlock({"__type__":"entity_ticking_area","entity_ticking_area_id":destructionData.data.player.__unique_id__}, destructionData.data.block_position).__identifier__ == "minecraft:cauldron") {
  			commandConvert(`replaceitem entity ` + system.getComponent(destructionData.data.player, "minecraft:nameable").data.name + ' slot.weapon.mainhand 0 korona:obsidian_sword');
  			commandConvert(`playsound random.fizz @a ` + destructionData.data.block_position.x + ' ' + destructionData.data.block_position.y + ' ' + destructionData.data.block_position.z);
  			commandConvert('particle minecraft:water_evaporation_bucket_emitter ' + destructionData.data.block_position.x + ' ' + destructionData.data.block_position.y + ' ' + destructionData.data.block_position.z);
  			showAchievement(destructionData.data.player, 'Wodno-lawowy incydent', 'Stwórz Obsydianowy miecz gasząc Diabelskie ostrze w kotle', 'makeobssword');
  		};
	});

	this.listenForEvent("minecraft:entity_dropped_item", function(dropData) {
		let dropItem = dropData.data.item_stack.__identifier__
		if (dropItem == 'korona:paladins_sword' || dropItem == 'korona:tool_table' || dropItem == 'korona:lute_strenght' || dropItem == 'korona:lute_speed' || dropItem == 'korona:lute_haste') {
			delayFunction(()=>{
				commandConvert("give " + system.getComponent(dropData.data.entity, "minecraft:nameable").data.name + ' ' + dropItem);
				commandConvert('tellraw ' + system.getComponent(dropData.data.entity, "minecraft:nameable").data.name + ' {"rawtext":[{"text":"§cNie możesz upuszczać przedmiotów profesji!"}]}');
				showAchievement(dropData.data.entity, 'Ziemia to nie śmietnik', 'Sprubuj wyrzucić przedmiot profesji postaci lub z nim umrzeć', 'classitemdrop');
			}, 20 * 1 )
			let itemPosition = system.getComponent(classItemData, "minecraft:position");
			itemPosition.data.y = (-1000)
			system.applyComponentChanges(classItemData, itemPosition);
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
	system.listenForEvent("minecraft:entity_death", function(deathData) {
		if (deathData.data.entity.__identifier__ == "minecraft:player") {
			// let inventoryContainer = system.getComponent(deathData.data.entity, "minecraft:inventory_container").data;
			// for (var myCounter = 0; myCounter < inventoryContainer.length; myCounter++) {

			// }
			if (deathData.data.killer.__identifier__ == "minecraft:player") {
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
 	if (this.counter % 5 == 0) {
 		systemServer.log("test");
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
									npcTag = entityTags[myCounter3];
								}
							}
							system.log("działa");
							if (splitedEntityTags[2] !== undefined) {
								delayFunction(()=>{
									commandConvert("dialogue change @e[tag=" + npcTag + "] " + splitedEntityTags[2]);
								}, 20 * 5 + 2)
							}
							delayFunction(()=>{
								commandConvert("event entity @e[tag=" + npcTag + "] korona:add_npc");
							}, 20 * 5 )
							mode = "npcTag";
							break;
						case "using_scroll":
							// system.log("used_scroll");
							mode = "playerName";
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							if (guildGuyIsFounded == true) {
								let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag");
								let playersGuildNumber = 0;
								for (var myCounter4 = 0; myCounter4 < guildGuyTags.data.length; myCounter4++) {
									let splitedTags = guildGuyTags.data[myCounter4].split('-');
									if (splitedTags[0] == "guild" && splitedTags[1] == playerName) {
										// system.log("yes");
										playersGuildNumber += 1;
									}
								}
								// system.log('gracz posiada ' + playersGuildNumber + ' gildii');
								if (playersGuildNumber < 6) {
									let guildId = Math.floor(Math.random()*(999999 - 100000 + 1)) + 100000;
									showAchievement(entitiesWithTags[myCounter], 'Własna gildia', 'Utwórz własną gildię przy użyciu Zwoju gildii', 'ownguild');
									commandConvert("tag @e[tag=npc_yalio] add guild-" + playerName + '-no-' + guildId);
									commandConvert("clear " + playerName + " korona:unsealed_guild_scroll 0 1");
									commandConvert("give " + playerName + " korona:guild_scroll");
									commandConvert("give " + playerName + " korona:heart_of_base_item");
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§7Stworzyłeś gildię o identifikatorze §c' + guildId + '§7. Aby ją aktywować użyj komendy: !guild activate [identifikator gildii] [nazwa gildii] [prefiks gildii]"}]}');
								} else {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cMożesz posiadać maksymalnie 5 gildii. Aby stworzyć nową, usuń inną używając komendy: §7!guild remove [nazwa gildii lub identifikator]"}]}');
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono §7Yalio (Dyplomaty) §c. Podejź do niego, aby serwer mógł zapisać jego dane"}]}');
							}
							break;
						case "using_horn":
							mode = "playerName";
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							let playerPosition = system.getComponent(entitiesWithTags[myCounter], "minecraft:position").data;
							let victimPosition = system.getComponent(victimData, "minecraft:position").data;
							let playerRotation = system.getComponent(entitiesWithTags[myCounter], "minecraft:rotation").data;
							let distance = Math.round(Math.sqrt(Math.pow(Math.abs(victimPosition.x - playerPosition.x), 2) + Math.pow(Math.abs(victimPosition.z - playerPosition.z), 2)));
							commandConvert('title ' + playerName + ' actionbar ' + tier(5, 35, 85, 200, distance) + ' §2' + distance + `m §6` + getArrow(getRelativeAngle(playerRotation.y, playerPosition.x, playerPosition.z, victimPosition.x, victimPosition.z)));

							break;
						case "list_guilds":
							let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag").data;
							mode = "playerName";
							let playerGuilds = [];
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							for (var myCounter4 = 0; myCounter4 < guildGuyTags.length; myCounter4++) {
								let splitedTag = guildGuyTags[myCounter4].split('-');
								if (splitedTag[0] == 'guild' && splitedTag[1] == playerName){
									if (splitedTag[2] == "yes") {
										playerGuilds.push(' §c[§6aktywne: §ftak, §6nazwa: §f' + splitedTag[3] + ', §6prefiks: §f' + splitedTag[4] + ', §6gracze: §f' + splitedTag[5] + ' §6kuboidy: §f' + splitedTag[6] + '§c]');
									} else if (splitedTag[2] == "no") {
										playerGuilds.push(' §c[§6aktywne: §fnie, §6id: §f' + splitedTag[3] + '§c]');
									}
								}
							}
							if (playerGuilds.length !== 0) {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "Posiadasz następujące gildie: ' + playerGuilds + '"}]}');
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "Nie posiadasz żadnych gildii"}]}');
							}
							break;
						case "activate_guild":
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							mode = "playerName";
							if (guildGuyIsFounded == true) {
								let activatedGuild = undefined;
								let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag");
								let duplicatedGuild = false;
								for (var myCounter5 = 0; myCounter5 < guildGuyTags.data.length; myCounter5++) {
									let splitedTag = guildGuyTags.data[myCounter5].split('-');
									if (splitedTag[0] == `guild`) {
										if (splitedTag[3] == splitedEntityTags[3] || splitedTag[4] == splitedEntityTags[4]) {
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cGildia o podanej nazwie lub prefiksie już istnieje. Prosimy o ich zmianę"}]}');
											duplicatedGuild = true;
										}
									}
								}
								if (duplicatedGuild == false) {
									for (var myCounter5 = 0; myCounter5 < guildGuyTags.data.length; myCounter5++) {
										let splitedTag = guildGuyTags.data[myCounter5].split('-');
										if (activatedGuild !== true) {
											if (splitedTag[0] == `guild` && splitedTag[1] == playerName && splitedTag[2] == `no` && splitedTag[3] == splitedEntityTags[2]) {
												guildGuyTags.data[myCounter5] = `guild-` + playerName + `-yes-` + splitedEntityTags[3] + `-` + splitedEntityTags[4] + `-` + playerName + `-brak`;
												system.applyComponentChanges(guildGuyData, guildGuyTags)
												activatedGuild = true;
												commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§7Aktywowano gildię. Nazywa się ona teraz §6' + splitedEntityTags[3] + '§7 i posiada prefiks §6' + splitedEntityTags[4] + '"}]}');
											} else {
												activatedGuild = false;
											}
										}
									}
								}
								if (activatedGuild == false) {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono gildii o podanym identyfikatorze (guild activate >>' + splitedEntityTags[2] + '<<)"}]}');
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono §7Yalio (Dyplomaty) §c. Podejź do niego, aby serwer mógł zapisać jego dane"}]}');
							}
							break;
						case "remove_guild":
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							mode = "playerName";
							if (guildGuyIsFounded == true) {
								let guildIsFound = false;
								let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag");
								for (var myCounter5 = 0; myCounter5 < guildGuyTags.data.length; myCounter5++) {
									let splitedTag = guildGuyTags.data[myCounter5].split('-');
									if (splitedTag[0] == `guild` && splitedTag[1] == playerName && splitedTag[3] == splitedEntityTags[2]) {
										guildIsFound = true;
										if (splitedTag[2] == "yes") {
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§7Usunięto gildię o nazwie §6' + splitedTag[3] + '§7[§6' + splitedTag[4] + '§7] i nie jest ona teraz przypisana do serc bazy: §6' + splitedTag[6] + '"}]}');
										} else if (splitedTag[2] == "no") {
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§7Usunięto gildię o identyfikatorze §6' + splitedTag[3] + '"}]}');
										}
										guildGuyTags.data.splice(myCounter5, 1);
										system.applyComponentChanges(guildGuyData, guildGuyTags);
									}
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono §7Yalio (Dyplomaty) §c. Podejź do niego, aby serwer mógł zapisać jego dane"}]}');
							}
							break;
						case "assign_guild":
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							mode = "playerName";
							if (guildGuyIsFounded == true) {
								let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag");
								let foundedCuboid = undefined;
								let guildIsFounded = false;
								let foundedGuild = false;
								let foundedCuboidNumber = undefined;
								let cuboidsId
								for (var myCounter5 = 0; myCounter5 < heartList.length; myCounter5++) {
									if (heartList[myCounter5].id == splitedEntityTags[3] && heartList[myCounter5].upgrades.indexOf('guild_scroll') >= 0) {
										if (heartList[myCounter5].owner == playerName) {
											cuboidsId = heartList[myCounter5].id;
											foundedCuboidNumber = myCounter5;
											foundedCuboid = true;
										} else {
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie jesteś właścicielem wprowadzonego serca bazy"}]}');
											foundedCuboid = false;
										}
									}
								}
								if (foundedCuboid !== undefined && foundedCuboid !== false) {
									for (var myCounter5 = 0; myCounter5 < guildGuyTags.data.length; myCounter5++) {
										let splitedTag = guildGuyTags.data[myCounter5].split('-');
										if (splitedTag[0] == 'guild' && splitedTag[3] == splitedEntityTags[2]) {
											if (splitedTag[2] == `yes`) {
												if (splitedTag[1] == playerName) {
													foundedGuild = true;
													let returnData = undefined;
													let listOfCuboids = splitedTag[6].split("_");
													if (listOfCuboids.indexOf(splitedEntityTags[3]) >= 0) {
														commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cTa gildia jest już przypisana do tego serca bazy"}]}');
													} else {
														if (splitedTag[6] == "brak") {
															returnData = splitedEntityTags[3];
														} else {
															returnData = splitedTag[6] + "_" + splitedEntityTags[3];
														}
														listOfPlayers = splitedTag[5].split('_');
														updatePlayers(listOfPlayers, foundedCuboidNumber)
														commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§7Przypisałeś/aś serce bazy o identyfikatorze §6' + cuboidsId + ' §7do gildii o nazwie §6' + splitedTag[3] + '§7. Gracze z tej gildii będą mieli teraz dostęp do budowanie na obszarze tego serca bazy"}]}');
														commandConvert('tag @e[type=korona:heart_of_base, tag=id-' + heartList[foundedCuboidNumber].id + '] add guild-' + splitedTag[3]);
														heartList[foundedCuboidNumber].guilds = splitedTag[3];
														guildGuyTags.data[myCounter5] = "guild-" + splitedTag[1] + "-" + splitedTag[2] + "-" + splitedTag[3] + "-" + splitedTag[4] + "-" + splitedTag[5] + "-" + returnData;
														system.applyComponentChanges(guildGuyData, guildGuyTags);
													}
												} else {
													commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie jesteś właścicielem wprowadzonej gildii"}]}');
													foundedGuild = false;
												}
											} else {
												commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cGildia musi być aktywna"}]}');
												foundedGuild = false;
											}
										}
									}
								} else if (foundedCuboid !== false) {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono wprowadzonego serca bazy. Pamiętaj, że serce bazy musi mieć włożony zwój gildii, aby przypisać do niego gildię"}]}');
								}
								if (foundedGuild == undefined) {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cGildia o podanej nazwie lub identyfikatorze nie istnieje"}]}');
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono §7Yalio (Dyplomaty) §c. Podejź do niego, aby serwer mógł zapisać jego dane"}]}');
							}
							break;
						case "unassign_guild":
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							mode = "playerName";
							if (guildGuyIsFounded == true) {
								let heartIsFounded = false;
								let guildIsFounded = false;
								// system.log("faza0");
								for (var myCounter8 = 0; myCounter8 < heartList.length; myCounter8++) {
									if (heartList[myCounter8].id == splitedEntityTags[3]) {
										heartIsFounded = true;
										if (heartList[myCounter8].guilds !== null) {
											// system.log("faza1");
											let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag");
											for (var myCounter5 = 0; myCounter5 < guildGuyTags.data.length; myCounter5++) {
												// system.log("faza2 - " + guildGuyTags.data[myCounter5]);
												let splitedTag = guildGuyTags.data[myCounter5].split('-');
												// (sprawdzanie czy gildia, sprawdzanie czy właściciel serca jest gildii, sprawdzanie czy nazwa jest zgodna)
												if (splitedTag[0] == `guild` && splitedTag[1] == playerName && splitedTag[3] == splitedEntityTags[2]) {
													// system.log("faza3");
													guildIsFounded = true;
													if (splitedTag[3] == heartList[myCounter8].guilds) {
														let splitedGuilds = splitedTag[6].split("_");
														for (var myCounter6 = 0; myCounter6 < splitedGuilds.length; myCounter6++) {
															// system.log("faza4");
															if (splitedGuilds[myCounter6] == heartList[myCounter8].id) {
																let thisHeartTags;
																let thisHeartData;
																let heartQuery = system.registerQuery();
																system.addFilterToQuery(heartQuery, "minecraft:inventory");
																let entitiesWithInventory = system.getEntitiesFromQuery(heartQuery);
																for (var myCounter9 = 0; myCounter9 < entitiesWithInventory.length; myCounter9++) {
																	if (entitiesWithInventory[myCounter9].__identifier__ == "korona:heart_of_base") {
																		let heartTags = system.getComponent(entitiesWithInventory[myCounter9], "minecraft:tag");
																		for (var myCounter7 = 0; myCounter7 < heartTags.data.length; myCounter7++) {
																			let splitedTag = heartTags.data[myCounter7].split("-");
																			if (splitedTag[0] == "id" && splitedTag[1] == splitedEntityTags[3]) {
																				thisHeartTags = heartTags;
																				thisHeartData = entitiesWithInventory[myCounter9];
																			}
																		}
																	}
																}
																for (var myCounter9 = 0; myCounter9 < thisHeartTags.data.length; myCounter9++) {
																	let splitedTag = thisHeartTags.data[myCounter9].split("-");
																	if (splitedTag[0] == "guild") {
																		thisHeartTags.data.splice(myCounter9, 1);
																		system.applyComponentChanges(thisHeartData, thisHeartTags);
																	}
																}
																for (var myCounter9 = 0; myCounter9 < heartList[myCounter8].players.length; myCounter9++) {
																	let heartPlayer = heartList[myCounter8].players[myCounter9];
																	if (heartPlayer !== heartList[myCounter8].owner) {
																		commandConvert('tag @e[tag=id-' + heartList[myCounter8].id + '] remove player-' + heartPlayer);
																	}
																}
																heartList[myCounter8].players = [heartList[myCounter8].owner];

																commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§7Do twojego serca bazy o identyfikatorze §6' + splitedEntityTags[3] + ' §7nie jest już przypisana gildia o nazwie §6' + splitedEntityTags[2] + '"}]}');
																splitedGuilds.splice(myCounter6, 1);

																heartList[myCounter8].guilds = null;
																splitedTag[6] = splitedGuilds.toString().replace(/,/g, '_');
																if (splitedTag[6] == '') {
																	splitedTag[6] = 'brak'
																}

																guildGuyTags.data[myCounter5] = splitedTag.toString().replace(/,/g, '-');
																system.applyComponentChanges(guildGuyData, guildGuyTags);
																// system.log("faza5 - " + playerName + " - " + entityTags[myCounter2]);
															}
														}
													} else {
														commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cWprowadzona gildia (' + splitedEntityTags[2] + ') nie jest przypisana do wprowadzonego serca bazy (' + splitedEntityTags[3] + ')"}]}');
													}
												}
											}
										} else {
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cDo wprowadzonego serca bazy (' + splitedEntityTags[3] + ') nie jest przypisana żadna gildia"}]}');
											guildIsFounded = undefined;
										}
									}
								}
								if (heartIsFounded == false) {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cSerce bazy o wprowadzonym identyfikatorze (' + splitedEntityTags[3] + ') nie istnieje"}]}');
								} else if (guildIsFounded == false) {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cGildia o podanej nazwie (' + splitedEntityTags[2] + ') nie istnieje lub nie jesteś jej właścicielem"}]}');
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono §7Yalio (Dyplomaty) §c. Podejź do niego, aby serwer mógł zapisać jego dane"}]}');
							}
							break;
						case "add_player":
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							mode = "playerName";
							if (guildGuyIsFounded == true) {
								let guildIsFounded = false;
								let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag");
								for (var myCounter9 = 0; myCounter9 < guildGuyTags.data.length; myCounter9++) {
									let splitedTag = guildGuyTags.data[myCounter9].split('-');
									if (splitedTag[0] == 'guild' && splitedTag[3] == splitedEntityTags[2] && splitedTag[1] == playerName) {
										guildIsFounded = true;
										let isPlayerInList = false;
										let splitedPlayers = splitedTag[5].split('_');
										for (var myCounter10 = 0; myCounter10 < splitedPlayers.length; myCounter10++) {
											if (splitedPlayers[myCounter10] == splitedEntityTags[3]) {
												isPlayerInList = true;
											}
										}
										if (isPlayerInList == true) {
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cPodany gracz jest już w tej gildii"}]}');
										} else {
											let splitedHearts = splitedTag[6].split('_');
											splitedPlayers.push(splitedEntityTags[3]);
											commandConvert('tellraw ' + splitedEntityTags[3] + ' {"rawtext":[{"text": "§6Zostałeś dodany do gildii §c' + splitedTag[3] + '§6!"}]}');
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§7Gracz §6' + splitedEntityTags[3] + ' §7został dodany do gildii §6' + splitedTag[3] + '§7!"}]}');
											for (var myCounter11 = 0; myCounter11 < splitedHearts.length; myCounter11++) {
												for (var myCounter12 = 0; myCounter12 < heartList.length; myCounter12++) {
													if (heartList[myCounter12].id == splitedHearts[myCounter11]) {
														updatePlayers(splitedPlayers, myCounter12);
													}
												}
											}
											splitedTag[5] = splitedPlayers.toString().replace(/,/g, '_');
											if (splitedTag[5] == '') {
												splitedTag[5] = splitedTag[1]
											}
											guildGuyTags.data[myCounter9] = splitedTag.toString().replace(/,/g, '-');
											system.applyComponentChanges(guildGuyData, guildGuyTags);
										}
									}
								}
								if (guildIsFounded == false) {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cPodana gildia nie istnieje lub nie jesteś jej właścicielem"}]}');
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono §7Yalio (Dyplomaty) §c. Podejź do niego, aby serwer mógł zapisać jego dane"}]}');
							}
							break;
						case "remove_player":
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							mode = "playerName";
							if (guildGuyIsFounded == true) {
								let guildIsFounded = false;
								let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag");
								for (var myCounter9 = 0; myCounter9 < guildGuyTags.data.length; myCounter9++) {
									let splitedTag = guildGuyTags.data[myCounter9].split('-');
									if (splitedTag[0] == 'guild' && splitedTag[3] == splitedEntityTags[2] && splitedTag[1] == playerName) {
										guildIsFounded = true;
										let isPlayerInList = false;
										let splitedPlayers = splitedTag[5].split('_');
										for (var myCounter10 = 0; myCounter10 < splitedPlayers.length; myCounter10++) {
											if (splitedPlayers[myCounter10] == splitedEntityTags[3]) {
												if (splitedPlayers[myCounter10] !== splitedTag[1]) {
													isPlayerInList = true;
													let splitedHearts = splitedTag[6].split('_');
													splitedPlayers.splice(myCounter10, 1);
													commandConvert('tellraw ' + splitedEntityTags[3] + ' {"rawtext":[{"text": "§6Zostałeś usunięty do gildii §c' + splitedTag[3] + '§6!"}]}');
													commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§7Gracz §6' + splitedEntityTags[3] + ' §7został usunięty z gildii §6' + splitedTag[3] + '§7!"}]}');
													for (var myCounter11 = 0; myCounter11 < splitedHearts.length; myCounter11++) {
														for (var myCounter12 = 0; myCounter12 < heartList.length; myCounter12++) {
															if (heartList[myCounter12].id == splitedHearts[myCounter11]) {
																updatePlayers(splitedPlayers, myCounter12);
															}
														}
													}
													splitedTag[5] = splitedPlayers.toString().replace(/,/g, '_');
													if (splitedTag[5] == '') {
														splitedTag[5] = splitedTag[1]
													}
													guildGuyTags.data[myCounter9] = splitedTag.toString().replace(/,/g, '-');
													system.applyComponentChanges(guildGuyData, guildGuyTags);
												} else {
													commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cPodany gracz to właściciel gildii"}]}');
												}
											}
										}
										if (isPlayerInList == false) {
											commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cPodanego gracza nie ma w gildii"}]}');
										}
									}
								}
								if (guildIsFounded == false) {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cPodana gildia nie istnieje lub nie jesteś jej właścicielem"}]}');
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono §7Yalio (Dyplomaty) §c. Podejź do niego, aby serwer mógł zapisać jego dane"}]}');
							}
							break;
						case "admin_mode":
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							let adminTags = system.getComponent(entitiesWithTags[myCounter], "minecraft:tag");
							mode = "playerName";
							let isAdmin = false;
							let isAdminMode = false;
							for (var myCounter9 = 0; myCounter9 < adminTags.data.length; myCounter9++) {
								if (adminTags.data[myCounter9] == 'admin') {
									isAdmin = true;
								}
								if (adminTags.data[myCounter9] == 'admin_mode') {
									isAdminMode = true;
								}
							}
							if (isAdmin == true) {
								if (isAdminMode == false) {
									let adminInventoryData = system.getComponent(entitiesWithTags[myCounter], "minecraft:inventory_container");
									let adminHotbarData = system.getComponent(entitiesWithTags[myCounter], "minecraft:hotbar_container");
									let isAnyItem = false;
									for (var myCounter10 = 0; myCounter10 < adminInventoryData.data.length; myCounter10++) {
										if (adminInventoryData.data[myCounter10].__identifier__ !== 'minecraft:undefined') {
											system.log('jakiś przedmiot1');
											isAnyItem = true;
										}
									}
									for (var myCounter10 = 0; myCounter10 < adminHotbarData.data.length; myCounter10++) {
										if (adminHotbarData.data[myCounter10].__identifier__ !== 'minecraft:undefined') {
											system.log('jakiś przedmiot2');
											isAnyItem = true;
										}
									}
									if (isAnyItem == true) {
										commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§cUWAGA: §7W twoim ekwipunku znajdują się przedmioty. Wyciągnij je z ekwipunku i schowaj w bezpieczne miejsce aby ich nie stracić. Upewnij się również czy nie masz założonej zbroi"}]}');
									} else {
										let adminPosition = system.getComponent(entitiesWithTags[myCounter], "minecraft:position");
										commandConvert('give ' + playerName + ' korona:admin_levitation');
										commandConvert('give ' + playerName + ' korona:admin_food');
										commandConvert('give ' + playerName + ' korona:admin_invisibility_false');
										commandConvert('give ' + playerName + ' korona:admin_speed_0');
										commandConvert('tag ' + playerName + ' add admin_mode');
										commandConvert('tag ' + playerName + ' add adm-bsc');
										commandConvert('event entity ' + playerName + ' korona:remove_damage');
										commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§6TRYB ADMINISTRATORA AKTYWNY"}]}');
										adminModeData.push({
											"name": playerName,
											"position": {
												"x": adminPosition.data.x,
												"y": adminPosition.data.y,
												"z": adminPosition.data.z
											}
										})
									}
								} else {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cJesteś już w trybie administratora"}]}');
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie jesteś administratorem serwera"}]}');
							}
							break;
						case "admin_mode_leave":
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							mode = "playerName";

							let adminTags2 = system.getComponent(entitiesWithTags[myCounter], "minecraft:tag");

							let isAdmin2 = false;
							let isAdminMode2 = false;
							for (var myCounter9 = 0; myCounter9 < adminTags2.data.length; myCounter9++) {
								if (adminTags2.data[myCounter9] == 'admin') {
									isAdmin2 = true;
								}
								if (adminTags2.data[myCounter9] == 'admin_mode') {
									isAdminMode2 = true;
								}
							}
							if (isAdmin2 == true) {
								if (isAdminMode2 == true) {
									let adminPosition = system.getComponent(entitiesWithTags[myCounter], "minecraft:position");
									let isPlayerData = false;
									commandConvert('clear ' + playerName);
									commandConvert('tag ' + playerName + ' remove adm-bsc');
									commandConvert('tag ' + playerName + ' remove admin_mode');
									commandConvert('tag ' + playerName + ' remove adm-spd1');
									commandConvert('tag ' + playerName + ' remove adm-spd2');
									commandConvert('tag ' + playerName + ' remove adm-spd3');
									commandConvert('tag ' + playerName + ' remove adm-spd4');
									commandConvert('tag ' + playerName + ' remove adm-spd5');
									commandConvert('tag ' + playerName + ' remove adm-inv');
									commandConvert('event entity ' + playerName + ' korona:add_damage');
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§6TRYB ADMINISTRATORA WYŁĄCZONY"}]}');
									for (myCounter9 = 0; myCounter9 < adminModeData.length; myCounter9++) {
										if (adminModeData[myCounter9].name == playerName) {
											isPlayerData = true;
											adminPosition.data.x = adminModeData[myCounter9].position.x;
											adminPosition.data.y = adminModeData[myCounter9].position.y;
											adminPosition.data.z = adminModeData[myCounter9].position.z;
											system.applyComponentChanges(entitiesWithTags[myCounter], adminPosition);
										}
									}
									if (isPlayerData == false) {
										commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie znaleziono twoich danych na liście. Nie zostajesz przeteleportowany w ostatnie miejsce pobytu"}]}');
									}
								} else {
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie jesteś w trybie administratora"}]}');
								}
							} else {
								commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "[§cError§f] §cNie jesteś administratorem serwera"}]}');
							}
							break;
						case "quest":
							mode = "playerName";
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							switch (splitedEntityTags[2]) {
								case "first_quest":
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§6Dostałeś swojego pierwszego questa! §rMożesz podejżeć aktywne questy pod komendą §7!quest"}]}');
								case "john":
									commandConvert('tellraw ' + playerName + ' {"rawtext":[{"text": "§l§6-!- §r§lNowy quest: §6Zniknięcie Johna"}]}');
							}
							break;
						case "use_lute":
							mode = "playerName";
							playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
							system.log("Lutnia!");
							let colors = ['red', 'violet', 'green', 'blue']
							switch (splitedEntityTags[2]) {
								case "0":
									system.log("strenght!"); //32 sec
									commandConvert('execute ' + playerName + ' ~ ~ ~ playsound ui.clash_of_strenght @a[r=5]');
									commandConvert('execute ' + playerName + ' ~ ~ ~ effect @a[r=5] strength 32 0');
									for (var myCounter10 = 0; myCounter10 < 32; myCounter10++) {
										delayFunction(()=>{
											commandConvert('execute ' + playerName + ' ~ ~ ~ particle korona:music_' + colors[Math.floor(Math.random()*4)] + ' ~ ~ ~');
											commandConvert('execute ' + playerName + ' ~ ~ ~ particle korona:music_' + colors[Math.floor(Math.random()*4)] + ' ~ ~ ~');
										}, 20 * myCounter10 + 1 )
									}
									break;
								case "1":
									system.log("speed!"); //27 sec
									commandConvert('execute ' + playerName + ' ~ ~ ~ playsound ui.race_against_time @a[r=5]');
									commandConvert('execute ' + playerName + ' ~ ~ ~ effect @a[r=5] speed 27 0');
									for (var myCounter10 = 0; myCounter10 < 32; myCounter10++) {
										delayFunction(()=>{
											commandConvert('execute ' + playerName + ' ~ ~ ~ particle korona:music_' + colors[Math.floor(Math.random()*4)] + ' ~ ~ ~');
											commandConvert('execute ' + playerName + ' ~ ~ ~ particle korona:music_' + colors[Math.floor(Math.random()*4)] + ' ~ ~ ~');
										}, 20 * myCounter10 + 1 )
									}
									break;
								case "2":
									system.log("haste!");  //20 sec
									commandConvert('execute ' + playerName + ' ~ ~ ~ playsound ui.power_in_haste @a[r=5]');
									commandConvert('execute ' + playerName + ' ~ ~ ~ effect @a[r=5] haste 20 0');
									for (var myCounter10 = 0; myCounter10 < 32; myCounter10++) {
										delayFunction(()=>{
											commandConvert('execute ' + playerName + ' ~ ~ ~ particle korona:music_' + colors[Math.floor(Math.random()*4)] + ' ~ ~ ~');
											commandConvert('execute ' + playerName + ' ~ ~ ~ particle korona:music_' + colors[Math.floor(Math.random()*4)] + ' ~ ~ ~');
										}, 20 * myCounter10 + 1 )
									}
									break;
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
					guildGuyData = entitiesWithTags[myCounter];
					guildGuyIsFounded = true;
				} else if (splitedEntityTags[0] == "victim" && victimIsFounded !== true) {
					victimData = entitiesWithTags[myCounter];
					victimIsFounded = true;
				} else if (splitedEntityTags[0] == "adm") {
					let playerName = system.getComponent(entitiesWithTags[myCounter], "minecraft:nameable").data.name;
					switch (splitedEntityTags[1]) {
						case 'inv':
							commandConvert('effect ' + playerName + ' invisibility 1 1 true');
							break;
						case 'bsc':
							commandConvert('effect ' + playerName + ' resistance 1 100 true');
							commandConvert('effect ' + playerName + ' mining_fatigue 1 100 true');
							commandConvert('effect ' + playerName + ' regeneration 1 100 true');
							break;
						case 'spd1':
							commandConvert('effect ' + playerName + ' speed 1 0 true');
							break;
						case 'spd2':
							commandConvert('effect ' + playerName + ' speed 1 1 true');
							break;
						case 'spd3':
							commandConvert('effect ' + playerName + ' speed 1 2 true');
							break;
						case 'spd4':
							commandConvert('effect ' + playerName + ' speed 1 3 true');
							break;
						case 'spd5':
							commandConvert('effect ' + playerName + ' speed 1 4 true');
							break;
					}
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
		let entitiesWithInventory = system.getEntitiesFromQuery(heartQuery);
		for (var myCounter = 0; myCounter < entitiesWithInventory.length; myCounter++) {
			if (entitiesWithInventory[myCounter].__identifier__ == "minecraft:player") {
				let playerArmor = system.getComponent(entitiesWithInventory[myCounter], "minecraft:armor_container").data;
				
				let playerName = system.getComponent(entitiesWithInventory[myCounter], "minecraft:nameable").data.name;
				if (playerArmor[0].item == "korona:soul_helmet" || playerArmor[1].item == "korona:soul_chestplate" || playerArmor[2].item == "korona:soul_leggings" || playerArmor[3].item == "korona:soul_boots" || playerArmor[3].item == "korona:hermes_boots") {
					let playerHealth = system.getComponent(entitiesWithInventory[myCounter], "minecraft:health");
					playerHealth.data.max = 20
					if (playerArmor[0].item == "korona:soul_helmet") {
						playerHealth.data.max += 2
					}
					if (playerArmor[1].item == "korona:soul_chestplate") {
						playerHealth.data.max += 2
					}
					if (playerArmor[2].item == "korona:soul_leggings") {
						playerHealth.data.max += 2
					}
					if (playerArmor[3].item == "korona:soul_boots") {
						playerHealth.data.max += 2
					}
					if (playerArmor[3].item == "korona:hermes_boots") {
						commandConvert('effect ' + playerName + ' slow_falling 3 0');
						commandConvert('effect ' + playerName + ' speed 3 1');
					}
					if (playerArmor[3].item == "korona:soul_boots" && playerArmor[2].item == "korona:soul_leggings" && playerArmor[1].item == "korona:soul_chestplate" && playerArmor[0].item == "korona:soul_helmet") {
						playerHealth.data.max += 2
						commandConvert("effect " + playerName + " speed 5 0 true");
 						commandConvert("effect " + playerName + " strength 5 0 true");
 						showAchievement(entitiesWithInventory[myCounter], 'Podarek godny króla', 'Skompletuj i załóż całą zbroję dusz, aby zdobyć dodatkowe efekty', 'fullsoularmor');
					}
					system.applyComponentChanges(entitiesWithInventory[myCounter], playerHealth);
				}
			}
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
							isGuildScrollInTags = false
							for (var tagCounter = 0; tagCounter < heartTags.data.length; tagCounter++) {
								if (heartTags.data[tagCounter] == 'upgrade-guild_scroll') {
									isGuildScrollInTags = true
								}
							}
							if (isGuildScrollInTags == false) {
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
					newHeartData.tier = 0;
				} else if (isBlueRune == true && isRedRune == false && isPurpleRune == false) {
					newHeartData.tier = 1;
				} else if (isRedRune == true && isPurpleRune == false) {
					newHeartData.tier = 2;
				}
				for (var tagCounter = 0; tagCounter < heartTags.data.length; tagCounter++) {
					if (heartTags.data[tagCounter].split("-")[0] == "tier") {
						heartTags.data.splice(tagCounter, 1, "tier-" + newHeartData.tier.toString());
						system.applyComponentChanges(entitiesWithInventory[myCounter], heartTags);
					}
				}
				for (var myCounter2 = 0; myCounter2 < heartList.length; myCounter2++) {
					if (heartList[myCounter2].id == newHeartData.id) {
						isInHeartList = true;
					}
				}
				if (isGuildScroll == false && `upgrade-guild_scroll` in heartTags.data) {
					for (var tagCounter = 0; tagCounter < heartTags.data.length; tagCounter++) {
						if (heartTags.data[tagCounter] == `upgrade-guild_scroll`) {
							heartTags.data.splice(tagCounter, 1);
							let guildGuyTags = system.getComponent(guildGuyData, "minecraft:tag");
							for (var guildCounter = 0; guildCounter < guildGuyTags.data.lenght; guildCounter++) {
								let splitedTag = guildGuyTags.data[guildCounter].split("-");
								if (newHeartData.guilds == splitedTag[3]) {
									let listOfCuboids = splitedTag[6].split("_");
									for (var cuboidCounter = 0; cuboidCounter < listOfCuboids.lenght; cuboidCounter++) {
										if (listOfCuboids[cuboidCounter] == newHeartData.id) {
											listOfCuboids.splice(cuboidCounter, 1);
										}
									}
									let stringedList = listOfCuboids.toString()
									let returnData = undefined;
									if (stringedList == undefined) {
										returnData = 'brak';
									} else {
										returnData = stringedList.replace(/,/g, '_');
									}
									guildGuyTags.data[guildCounter] = "guild-" + splitedTag[1] + "-" + splitedTag[2] + "-" + splitedTag[3] + "-" + splitedTag[4] + "-" + splitedTag[5] + "-" + returnData;
								}
							}
							system.applyComponentChanges(guildGuyData, guildGuyTags);
							newHeartData.guilds = null;
							newHeartData.players = [newHeartData.owner];
							system.applyComponentChanges(entitiesWithInventory[myCounter], heartTags);
						} else if (heartTags.data[tagCounter].split('-')[0] == `guild`) {
							heartTags.data.splice(tagCounter, 1);
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