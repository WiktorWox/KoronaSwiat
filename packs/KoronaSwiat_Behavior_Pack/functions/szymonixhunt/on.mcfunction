tellraw @a {"rawtext":[{"text":"§6§l>>§r Rozpoczął się SzYmoniXhunt!"}]}
playsound note.iron_xylophone @a

tag endrju1988 add victim
tag @a[tag=!victim] add hunter
give @a[tag=!victim] korona:horn

setblock 1265 58 661 redstone_block

gamerule keepinventory true
gamerule pvp true