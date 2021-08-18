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
		system.log(e)

		let armorSlot = e.data.slot
  		let somethingHappend
  		let armor = e.data.item_stack.item
  		let playerId = e.data.entity
  		let nameComponent = system.getComponent(playerId, "minecraft:nameable");
  		let playerName = nameComponent.data.name

		tags = system.getComponent("minecraft:tag")
		system.log(tags)
		
  		switch (armor) {
  		    case "korona:soul_chestplate":
  		   		if (!(playerId in playersData)) {
		  			playersData[playerId] = {
			  	 		"soulChestPlateEquipped": false,
			  	 		"soulBootsEquipped": false,
			  	 		"soulHelmetEquipped": false,
			  	 		"soulLeggingsEquipped": false,
			  	 		"fullSoulArmorEquipped": false,
			  	 		"playerName": playerName
			  	 	}
			  	 	system.log(playersData[playerId])

		  		}

			    system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " add have_soul_armor"))
  		    	system.log("Założono napierśnik dusz")
	  	 		playersData[playerId].soulChestPlateEquipped = true

    			system.log("Gracz który założył zbroję nazywa się " + playerName)

	  	 		somethingHappend = true
	  	 		break;
	  	 	case "minecraft:undefined":
	  	 		if (playersData[playerId].soulChestPlateEquipped == true && armorSlot == "slot.armor.chest") {
	  	 			playersData[playerId].soulChestPlateEquipped = false

	  	 			system.broadcastEvent("minecraft:execute_command", commandConvert("tag " + playerName + " remove have_soul_armor"))

	  	 			system.log("Zdjęto napierśnik dusz")
	  	 		}
	  	 		somethingHappend = true
	  	 		break
  		}
	  	if (somethingHappend == true) {
	  		if (playersData[playerId].soulChestPlateEquipped == false && playersData[playerId].soulLeggingsEquipped == false && playersData[playerId].soulHelmetEquipped == false && playersData[playerId].soulBootsEquipped == false) {
		  	 	system.log("Zdjęto zbroję dusz")
		  	 	playersData[playerId].fullSoulArmorEquipped = false
		  	 	somethingHappend = undefined
		  	}
		  	if (playersData[playerId].soulChestPlateEquipped == true && playersData[playerId].soulLeggingsEquipped == true && playersData[playerId].soulHelmetEquipped == true && playersData[playerId].soulBootsEquipped == true) {
		  	 	system.log("Założono zbroję dusz")
		  	 	playersData[playerId].fullSoulArmorEquipped = true
		  	 	somethingHappend = undefined
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