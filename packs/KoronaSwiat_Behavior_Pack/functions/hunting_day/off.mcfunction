gamemode s @a[m=adventure]
gamerule keepinventory false
gamerule dodaylightcycle true
gamerule pvp false
scoreboard objectives remove kills

tellraw @a {"rawtext":[{"text":"[§6§lHunting Day log§r] Hunting Day się zakończył!"}]}
playsound note.pling @a