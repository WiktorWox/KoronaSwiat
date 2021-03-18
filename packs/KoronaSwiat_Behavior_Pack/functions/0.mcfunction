
 # (c) r4isen1920
tag @s add "0"

execute @s[tag=!"died"] ~~~ scoreboard players add @s deaths 1
execute @s[tag=!"died"] ~~~ scoreboard players add "§6Total Deaths§r " deaths 1

execute @s[tag=!"died",tag="killed"] ~~~ particle death:blood_release_particle ~~0.5~
execute @s[tag=!"died",tag="killed"] ~~~ particle death:blood_aura_particle ~~0.5~
execute @s[tag=!"died",tag="killed"] ~~~ playsound firework.blast @p[r=20] ~~0.5~ 100
execute @s[tag=!"died",tag="killed"] ~~~ playsound firework.large_blast @p[rm=20,r=60] ~~0.5~ 100
execute @s[tag=!"died",tag="killed"] ~~~ playsound firework.twinkle @p[r=15] ~~0.5~ 100

execute @s[tag=!"died"] ~~~ execute @p[c=1,tag="kill"] ~~~ function 1

tag @s add died