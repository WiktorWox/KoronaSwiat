var systemServer = server.registerSystem(0, 0);
var system = systemServer;
var tickNumber = 0;
var playersData = {

}

//command converter
function commandConvert(command) {
	return {
		"__type__" : "event_data",
		"data" : {
			"command" : command
		},
		"__identifier__" : "minecraft:execute_command"
	}
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

	//here script listening for time when entity equipped armor
	this.listenForEvent("minecraft:entity_equipped_armor", function(e) {

		//this is where the things needed to perform a function are downloaded
		let armorSlot = e.data.slot
  		let somethingHappend
  		let armor = e.data.item_stack.item
  		let playerId = e.data.entity
  		let nameComponent = system.getComponent(playerId, "minecraft:nameable");
  		let playerName = nameComponent.data.name
		let playerTagsData = system.getComponent(playerId, "minecraft:tag")
		let tags = playerTagsData.data

		//if id of pearson who equipped the armor is not saved in "playersData", that thing doing this
		if (!(playerId in playersData)) {
			playersData[playerId] = {
				"haveSoulHelmet": false,
				"haveSoulChestplate": false,
				"haveSoulLeggings": false,
				"haveSoulBoots": false
			}
		}

		//this is updater of "playersData" based on minecraft tags. When server is shutting down and turning on again things in script are lost but tags in minecraft are saved. In line 38 tags are downloaded
		if (tags.indexOf("have_any_piece") !== -1) {
			if (tags.indexOf("have_soul_helmet") !== -1) {
				playersData[playerId].haveSoulHelmet = true
			}
			if (tags.indexOf("have_soul_chestplate") !== -1) {
				playersData[playerId].haveSoulChestplate = true
			}
			if (tags.indexOf("have_soul_leggings") !== -1) {
				playersData[playerId].haveSoulLeggings = true
			}
			if (tags.indexOf("have_soul_boots") !== -1) {
				playersData[playerId].haveSoulBoots = true
			}
		}

		//here, using "switch" is checked armor what entity equipped
  		switch (armor) {
   		    case "korona:soul_helmet":
			    system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " add have_soul_helmet"))
			    playersData[playerId].haveSoulHelmet = true

  		    	system.log("Założono chełm dusz")
	  	 		somethingHappend = true
	  	 		break;
  		    case "korona:soul_chestplate":
			    system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " add have_soul_chestplate"))
			    playersData[playerId].haveSoulChestplate = true

  		    	system.log("Założono napierśnik dusz")
	  	 		somethingHappend = true
	  	 		break;
  		    case "korona:soul_leggings":
			    system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " add have_soul_leggings"))
			    playersData[playerId].haveSoulLeggings = true

  		    	system.log("Założono spodnie dusz")
	  	 		somethingHappend = true
	  	 		break;
  		    case "korona:soul_boots":
			    system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " add have_soul_boots"))
			    playersData[playerId].haveSoulBoots = true

  		    	system.log("Założono buty dusz")
	  	 		somethingHappend = true
	  	 		break;
	  	 	case "minecraft:undefined":
	  	 		if (playersData[playerId].haveSoulHelmet == true && armorSlot == "slot.armor.head") {
	  	 			system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " remove have_soul_helmet"))
	  	 			playersData[playerId].haveSoulHelmet = false

	  	 			system.log("Zdjęto chełm dusz")
	  	 			somethingHappend = true
	  	 		}
	  	 		if (playersData[playerId].haveSoulChestplate == true && armorSlot == "slot.armor.chest") {
	  	 			system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " remove have_soul_chestplate"))
	  	 			playersData[playerId].haveSoulChestplate = false

	  	 			system.log("Zdjęto napierśnik dusz")
	  	 			somethingHappend = true
	  	 		}
	  	 		if (playersData[playerId].haveSoulLeggings == true && armorSlot == "slot.armor.legs") {
	  	 			system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " remove have_soul_leggings"))
	  	 			playersData[playerId].haveSoulLeggings = false

	  	 			system.log("Zdjęto spodnie dusz")
	  	 			somethingHappend = true
	  	 		}
	  	 		if (playersData[playerId].haveSoulBoots == true && armorSlot == "slot.armor.feet") {
	  	 			system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " remove have_soul_boots"))
	  	 			playersData[playerId].haveSoulBoots = false

	  	 			system.log("Zdjęto buty dusz")
	  	 			somethingHappend = true
	  	 		}
	  	 		break
  		}
  		//What happening if:
	  	if (somethingHappend == true) {
	  		//entity don't have any piece of armor
	  		if (playersData[playerId].haveSoulHelmet == false && playersData[playerId].haveSoulChestplate == false && playersData[playerId].haveSoulLeggings == false && playersData[playerId].haveSoulBoots == false) {
		  	 	system.log("Zdjęto zbroję dusz")
		  	 	system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " remove have_any_piece"))
		  	 	somethingHappend = undefined
		  	} else {
		  		//entity have full armor
		  		if (playersData[playerId].haveSoulHelmet == true && playersData[playerId].haveSoulChestplate == true && playersData[playerId].haveSoulLeggings == true && playersData[playerId].haveSoulBoots == true) {
			  	 	system.log("Założono całą zbroję dusz")
			  	 	system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " add have_full_soul_armor"))

			  	 	somethingHappend = undefined
			  	} else {
			  		//entity don't have full armor and before have full armor
			  		if (playersData[playerId].haveSoulHelmet == false && tags.indexOf("have_full_soul_armor") !== -1 || playersData[playerId].haveSoulChestplate == false && tags.indexOf("have_full_soul_armor") !== -1 || playersData[playerId].haveSoulLeggings == false && tags.indexOf("have_full_soul_armor") !== -1 || playersData[playerId].haveSoulBoots == false && tags.indexOf("have_full_soul_armor") !== -1) {
					  	system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " remove have_full_soul_armor"))
					  	system.log(tags.indexOf("have_full_soul_armor"))

					  	somethingHappend = undefined
				  	} else {
				  		//entity have one or more piece of armor
				  		if (playersData[playerId].haveSoulHelmet == true || playersData[playerId].haveSoulChestplate == true || playersData[playerId].haveSoulLeggings == true || playersData[playerId].haveSoulBoots == true) {
					  	 	system.log("Założono jedną część zbroi dusz")
					  	 	system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " add have_any_piece"))
					  	 	somethingHappend = undefined
					  	}
				  	}
				}
		  	}
	  	}
	});

	// register event data, register components, register queries, listen for events, . . .

	this.counter = 0
	systemServer.log("initialize finished")
}

//5 secunds updater
systemServer.update = function () {
 	this.counter++
 	if (this.counter === 100) {
 		//every 5 seconds this updater giving effect for entity who have equipped armor
 		system.broadcastEvent("minecraft:execute_command", commandConvert("effect @a[tag=have_any_piece] speed 5 0 true"))
 		system.broadcastEvent("minecraft:execute_command", commandConvert("effect @a[tag=have_full_soul_armor] speed 5 1 true"))
 		this.counter = 0
 	}
}

//chat event converter from https://wiki.bedrock.dev/scripting/scripting-intro.html
systemServer.log = function (...items) {
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

	const chatEvent = this.createEventData('minecraft:display_chat_event')
	chatEvent.data.message = items.map(toString).join(' ')
	this.broadcastEvent('minecraft:display_chat_event', chatEvent)
}



system.onClientEnteredWorld = function(eventData) {
	system.log('entered')
	system.log(eventData)
};