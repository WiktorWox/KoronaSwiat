gamemode a @a
gamerule keepinventory true
time set day
gamerule dodaylightcycle false
gamerule pvp true
scoreboard objectives remove kills
scoreboard objectives add kills dummy §cZabójstwar
scoreboard players add "§6Wszystkie zabójstwa " kills 0
scoreboard objectives setdisplay sidebar kills

tellraw @a {"rawtext":[{"text":"[§6§lHunting Day log§r] Rozpoczął sią Hunting Day!"}]}
playsound note.pling @a