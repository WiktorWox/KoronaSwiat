import { World, Commands } from "Minecraft"

const commandPrefix = "!"

function customCommand(command, msg) {
    if (command.split(" ")[0] == "spawn") {
        Commands.run(`execute "${msg.sender.name}" ~~~ tp -316 66 5`)
        Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"Teleportujesz się na §6spawn§r!"}]}`)
    } else if (command.split(" ")[0] == "help") {
        Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"§6${commandPrefix}spawn §f- Teleportuje gracza z powrotem na spawn\\n§7|spawn\\n§6${commandPrefix}cuboid §f- Zarządza twoimi cuboidami\\n§7|cuboid add [pozycjaX] [pozycjaY] [pozycjaZ] [drugaPozycjaX] [drugaPozycjaY] [drugaPozycjaZ] [nazwaCuboida] [lista graczy z permisją]\\n§6${commandPrefix}help §f- Pokazuje listę komend\\n§7|help"}]}`)
    } else if (command.split(" ")[0] == "cuboid") {
        if (command.split(" ")[1] == "add") {
            if (command.split(" ")[8] !== undefined) {
                let lenghtX = Math.max(command.split(" ")[2], command.split(" ")[5]) - Math.min(command.split(" ")[2], command.split(" ")[5])
                let lenghtY = Math.max(command.split(" ")[3], command.split(" ")[6]) - Math.min(command.split(" ")[3], command.split(" ")[6])
                let lenghtZ = Math.max(command.split(" ")[4], command.split(" ")[7]) - Math.min(command.split(" ")[4], command.split(" ")[7])
                let amountOfBlocks = lenghtX * lenghtY * lenghtZ
                Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text": "Stworzyłeś cuboid §3${command.split(" ")[8]} §ro wielkości §c${amountOfBlocks} §rbloków!"}]}`)
            } else {
                Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text": "§cBłędne użycie komendy! Poprawne użycie: §7${commandPrefix}cuboid add [pozycjaX] [pozycjaY] [pozycjaZ] [drugaPozycjaX] [drugaPozycjaY] [drugaPozycjaZ] [nazwaCuboida]"}]}`)
            }
        } else if (command.split(" ")[1] == "list") {

        }
    } else {
        Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"§cNie znaleziono komendy! Sprawdź pisownię"}]}`)
    }
}

World.events.beforeChat.subscribe(msg => {
    if (msg.message.substr(0, commandPrefix.length) == commandPrefix) {
        msg.canceled = true
        customCommand(`${msg.message.substr(commandPrefix.length, msg.message.length - 1)}`, msg)
    }
})