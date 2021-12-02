tellraw @a {"rawtext":[{"text":"§6§l>>§r SzYmoniXhunt się zakończył!"}]}
playsound note.iron_xylophone @a

tag @a remove victim
tag @a remove hunter
clear @a korona:horn

setblock 1265 58 661 air

kill @e[type=korona:track]

gamerule keepinventory true
gamerule pvp true