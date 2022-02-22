import { World, Commands } from "mojang-minecraft";

const commandPrefix = "!";

function customCommand(command, msg) {
    let splitedCommand = command.split(" ")
    switch (splitedCommand[0]) {
        case "help":
            Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"§6${commandPrefix}spawn §f- Teleportuje gracza z powrotem na spawn\\n§7|spawn\\n§6${commandPrefix}cuboid §f- Zarządza twoimi cuboidami\\n§7|cuboid add [pozycjaX] [pozycjaY] [pozycjaZ] [drugaPozycjaX] [drugaPozycjaY] [drugaPozycjaZ] [nazwaCuboida] [lista graczy z permisją]\\n§6${commandPrefix}help §f- Pokazuje listę komend\\n§7|help"}]}`, World.getDimension("overworld"));
            break;
        case "horn":
            try{
                Commands.run(`execute "${msg.sender.name}" ~ ~ ~ give @s[tag=!victim] korona:horn`, World.getDimension("overworld"));
            } catch {
            }
 
            Commands.run(`execute "${msg.sender.name}" ~ ~ ~ tellraw @s[tag=victim] {"rawtext":[{"text":"[§cError§f] §cNie jesteś łowcą"}]}`, World.getDimension("overworld"));
            break;
        case "guild":
            switch (splitedCommand[1]) {
                case "activate":
                    if (splitedCommand[2] !== undefined && splitedCommand[3] !== undefined && splitedCommand[4] !== undefined) {
                        Commands.run(`tag "${msg.sender.name}" add tag_event-activate_guild-` + splitedCommand[2] + `-` + splitedCommand[3] + `-` + splitedCommand[4], World.getDimension("overworld"));
                    } else {
                        Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"[§cError§f] §cBłąd w składni. Brak jednej z danych gildii"}]}`, World.getDimension("overworld"));
                    }
                    break;
                case "player":
                    if (splitedCommand[2] == `add`) {
                        if (splitedCommand[3] !== undefined && splitedCommand[4] !== undefined) {
                            Commands.run(`tag "${msg.sender.name}" add tag_event-add_player-` + splitedCommand[3] + '-' + splitedCommand[4], World.getDimension("overworld"));
                        } else {
                            Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"[§cError§f] §cBłąd w składni. Brak nazwy gildii lub gracza"}]}`, World.getDimension("overworld"));
                        }
                    } else if (splitedCommand[2] == `remove`) {
                        if (splitedCommand[3] !== undefined && splitedCommand[4] !== undefined) {
                            Commands.run(`tag "${msg.sender.name}" add tag_event-remove_player-` + splitedCommand[3] + '-' + splitedCommand[4], World.getDimension("overworld"));
                        } else {
                            Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"[§cError§f] §cBłąd w składni. Brak nazwy gildii lub gracza"}]}`, World.getDimension("overworld"));
                        }
                    } else {
                        Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"[§cError§f] §cBłąd w składni (guild cuboid >>` + splitedCommand[2] + `<<)"}]}`, World.getDimension("overworld"));
                    }
                    break;
                case "list":
                    Commands.run(`tag "${msg.sender.name}" add tag_event-list_guilds`, World.getDimension("overworld"));
                    break;
                case "remove":
                    if (splitedCommand[2] !== undefined) {
                        Commands.run(`tag "${msg.sender.name}" add tag_event-remove_guild-` + splitedCommand[2], World.getDimension("overworld"));
                    } else {
                        Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"[§cError§f] §cBłąd w składni. Brak nazwy lub identyfikatora gildii"}]}`, World.getDimension("overworld"));
                    }
                    break;
                case `cuboid`:
                    if (splitedCommand[2] == `assign`) {
                        if (splitedCommand[3] !== undefined && splitedCommand[4] !== undefined) {
                            Commands.run(`tag "${msg.sender.name}" add tag_event-assign_guild-` + splitedCommand[3] + `-` + splitedCommand[4], World.getDimension("overworld"));
                        } else {
                            Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"[§cError§f] §cBłąd w składni. Brak identyfikatora gildii lub serca bazy"}]}`, World.getDimension("overworld"));
                        }
                    } else if (splitedCommand[2] == `unassign`) {
                        if (splitedCommand[3] !== undefined && splitedCommand[4] !== undefined) {
                            Commands.run(`tag "${msg.sender.name}" add tag_event-unassign_guild-` + splitedCommand[3] + `-` + splitedCommand[4], World.getDimension("overworld"));
                        } else {
                            Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"[§cError§f] §cBłąd w składni. Brak identyfikatora gildii lub serca bazy"}]}`, World.getDimension("overworld"));
                        }
                    } else {
                        Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"[§cError§f] §cBłąd w składni (guild cuboid >>` + splitedCommand[2] + `<<)"}]}`, World.getDimension("overworld"));
                    }
                    break;
                default:
                    Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"[§cError§f] §cBłąd w składni (guild >>` + splitedCommand[1] + `<<)"}]}`, World.getDimension("overworld"));
                    break;
            }
            break;
        case 'adm':
            Commands.run(`tag "${msg.sender.name}" add tag_event-admin_mode`, World.getDimension("overworld"));
            break;
        case 'adml':
            Commands.run(`tag "${msg.sender.name}" add tag_event-admin_mode_leave`, World.getDimension("overworld"));
            break;
        default:
            Commands.run(`tellraw "${msg.sender.name}" {"rawtext":[{"text":"[§cError§f] §cNie znaleziono komendy! Sprawdź pisownię"}]}`, World.getDimension("overworld"));
            break;
    }
}
//Checks if a command was run (checks for the prefix)
World.events.beforeChat.subscribe(msg => {
    if (msg.message.substr(0, commandPrefix.length) == commandPrefix) {
        msg.cancel = true
        customCommand(`${msg.message.substr(commandPrefix.length, msg.message.length - 1)}`, msg)
    }
})