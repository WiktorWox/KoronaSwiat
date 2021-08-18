var systemServer = server.registerSystem(0, 0);
var system = systemServer;
var tickNumber = 0;
var playersData = {

}

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

	this.listenForEvent("minecraft:entity_equipped_armor", function(e) {

		let armorSlot = e.data.slot
  		let somethingHappend
  		let armor = e.data.item_stack.item
  		let playerId = e.data.entity
  		let nameComponent = system.getComponent(playerId, "minecraft:nameable");
  		let playerName = nameComponent.data.name

		let playerTagsData = system.getComponent(playerId, "minecraft:tag")
		let tags = playerTagsData.data
		
		if (!(playerId in playersData)) {
			playersData[playerId] = {
				"haveSoulHelmet": false,
				"haveSoulChestplate": false,
				"haveSoulLeggings": false,
				"haveSoulBoots": false
			}
		}

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

  		    	system.log("Założono napierśnik dusz")
	  	 		somethingHappend = true
	  	 		break;
	  	 	case "minecraft:undefined":
	  	 		if (playersData[playerId].haveSoulChestplate == true && armorSlot == "slot.armor.chest") {
	  	 			system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " remove have_soul_chestplate"))
	  	 			playersData[playerId].haveSoulChestplate = false

	  	 			system.log("Zdjęto napierśnik dusz")
	  	 			somethingHappend = true
	  	 		}
	  	 		break
  		}
	  	if (somethingHappend == true) {
	  		if (playersData[playerId].haveSoulHelmet == false && playersData[playerId].haveSoulChestplate == false && playersData[playerId].haveSoulLeggings == false && playersData[playerId].haveSoulBoots == false) {
		  	 	system.log("Zdjęto zbroję dusz")
		  	 	system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " remove have_any_piece"))
		  	 	somethingHappend = undefined
		  	} else {
		  		if (playersData[playerId].haveSoulHelmet == true && playersData[playerId].haveSoulChestplate == true && playersData[playerId].haveSoulLeggings == true && playersData[playerId].haveSoulBoots == true) {
			  	 	system.log("Założono całą zbroję dusz")
			  	 	system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " remove have_any_piece"))
			  	 	somethingHappend = undefined
			  	} else {
			  		if (playersData[playerId].haveSoulHelmet == true || playersData[playerId].haveSoulChestplate == true || playersData[playerId].haveSoulLeggings == true || playersData[playerId].haveSoulBoots == true) {
				  	 	system.log("Założono jedną część zbroi dusz")
				  	 	system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " add have_any_piece"))
				  	 	somethingHappend = undefined
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
 		system.log("working")
 		this.counter = 0
 	}
}

//chat event converter
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