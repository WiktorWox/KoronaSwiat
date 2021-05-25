tellraw @a {"rawtext":[{"text":"§6§l>>§r SzYmoniXhunt się zakończył!"}]}
playsound note.iron_xylophone @a

tag @a remove prey
tag @a remove hunter

setblock 1265 58 661 air

kill @e[type=korona:track]

gamerule keepinventory true
gamerule pvp true