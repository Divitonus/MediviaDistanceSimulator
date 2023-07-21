class Character
{
	constructor(level, base_distance, dexterity, sheol_promo, sixth_sense, critical_agility)
	{
		this.level = level;
		this.base_distance = base_distance;
		this.dexterity = dexterity;
		this.sheol_promo = sheol_promo;
		this.sixth_sense = sixth_sense;
		this.critical_agility = critical_agility;
	}
}

class Enemy
{
	constructor(armor, phys_resist, fire_resist, energy_resist, poison_resist,
				ice_resist, death_resist, holy_resist, curse_resist,
				lifedrain_resist, manadrain_resist)
	{
		this.armor = armor;
		this.phys_resist = phys_resist;
		this.fire_resist = fire_resist;
		this.energy_resist = energy_resist;
		this.poison_resist = poison_resist;
		this.ice_resist = ice_resist;
		this.death_resist = death_resist;
		this.holy_resist = holy_resist;
		this.curse_resist = curse_resist;
		this.lifedrain_resist = lifedrain_resist;
		this.manadrain_resist = manadrain_resist;
	}
}

class Weapon
{
	constructor(weapon_name, ammo_atk, hit_bonus, precise, flawless, fast_hand,
				sharpshooter, slowing_shot, strike, strike_type, min_strike,
				max_strike, piercing, death, death_tick, poison, poison_tick,
				fire, fire_tick, ice, ice_tick, energy, energy_tick)
	{
		this.weapon_name = weapon_name;
		this.ammo_atk = ammo_atk;
		this.hit_bonus = hit_bonus;
		this.precise = precise;
		this.flawless = flawless;
		this.fast_hand = fast_hand;
		this.sharpshooter = sharpshooter;
		this.slowing_shot = slowing_shot;
		this.strike = strike;
		this.strike_type = strike_type;
		this.min_strike = min_strike;
		this.max_strike = max_strike;
		this.piercing = piercing;
		this.death = death;
		this.death_tick = death_tick;
		this.poison = poison;
		this.poison_tick = poison_tick;
		this.fire = fire;
		this.fire_tick = fire_tick;
		this.ice = ice;
		this.ice_tick = ice_tick;
		this.energy = energy;
		this.energy_tick = energy_tick;
	}
}

function armor_reduction(armor)
{
	const min_reduction = armor * 0.475;
	const max_reduction = (armor * 0.95) - 1 + min_reduction;
	const reduction = getRandomUniform(min_reduction, max_reduction);
	return reduction;
}

function sharpshooter_bonus(base_dist)
{
	const total_dist = Math.floor(base_dist * 1.1);
	return total_dist;
}

function full_atk(ammo_atk, flawless)
{
	const atk = ammo_atk + flawless;
	return atk;
}

function full_hit_chance(weapon_hit, distance, range)
{
	let total_hit = 0;
	switch (range)
	{
		case 1:
			total_hit = 40 + 0.33 * distance;
			break;
		case 2:
			total_hit = 50 + 0.44 * distance;
			break;
		case 3:
			total_hit = 50 + 0.55 * distance;
			break;
		case 4:
			total_hit = 40 + 0.66 * distance;
			break;
		case 5:
			total_hit = 40 + 0.66 * distance;
			break;
		case 6:
			total_hit = 40 + 0.55 * distance;
			break;
		case 7:
			total_hit = 35 + 0.44 * distance;
			break;
	}
	if (total_hit > 95)
	{
		total_hit = 95;
	}
	total_hit += weapon_hit;
	return total_hit;
}

function full_fast_hand_chance(fast_hand_prop, fast_hand_attri)
{
	const total_chance = fast_hand_prop + fast_hand_attri;
	return total_chance;
}

function max_shot_damage(atk, dist, dexterity, stance, sheol_promo)
{
	let max_damage = 20 + (Math.pow(dist, 2) / 1600 * atk / stance);
	max_damage += (dexterity * 1.2);
	if (sheol_promo === 1)
	{
		max_damage = max_damage * 1.05;
	}
	return Math.floor(max_damage);
}

function min_shot_damage(lvl, atk, dist, dexterity, stance, sheol_promo)
{
	const max_damage = 20 + (Math.pow(dist, 2) / 1600 * atk / stance);
	let min_damage = lvl / 5 + (max_damage * 0.20);
	min_damage += (dexterity * 0.8);
	if (sheol_promo === 1)
	{
		min_damage = min_damage * 1.05;
	}
	return Math.floor(min_damage);
}

function shot_damage(lvl, atk, dist, dexterity, stance, sheol_promo)
{
	let shot = 0.0;
	const max_damage = max_shot_damage(atk, dist, dexterity, stance, sheol_promo);
	const min_damage = min_shot_damage(lvl, atk, dist, dexterity, stance, sheol_promo);
	shot = getRandomInt(min_damage, max_damage);
	return shot;
}

function strike_damage(low_bound, high_bound, resist, max_shot)
{
	const min_damage = (low_bound / 100) * max_shot;
	const max_damage = (high_bound / 100) * max_shot;
	const damage = getRandomUniform(min_damage, max_damage) * (1 - resist / 100);
	return damage;
}

function does_it_hit(hit_chance)
{
	const random_hit = getRandomInt(1, 100);
	return random_hit <= hit_chance;
}

function getRandomUniform(min, max)
{
	return Math.random() * (max - min) + min;
}

function getRandomInt(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function MediviaDistanceSimulator(turns, stance, range_from_enemy, character, weapon, enemy)
{
	let current_dist = character.base_distance;
	let sharpshooter_duration = 0;
	const results = [];

	for (let second = 0; second < turns * 2; second++) {
		const atk = full_atk(weapon.ammo_atk, weapon.flawless);

		// Deal ancient crossbow death damage
		if (weapon.death && (second === 2 || second === 4)) {
			results.push({
				damage: Math.floor(weapon.death_tick * ((100 - enemy.death_resist) / 100)),
				second,
			});
		}

		if (second % 2 === 0) {
			// Check to see if the shot hits
			if (does_it_hit(full_hit_chance(weapon.hit_bonus, current_dist, range_from_enemy))) {
				// Activate ancient crossbow dot if it's used
				if (weapon.death) {
					results.push({
						damage: weapon.death_tick,
						second,
					});
				}
				
				//console.log("Sharpshooter: " + weapon.sharpshooter);
				// Check to see if sharpshooter procs
				if (does_it_hit(weapon.sharpshooter)) {
					if (sharpshooter_duration === 0) {
						current_dist = sharpshooter_bonus(current_dist);
					}
					sharpshooter_duration = 6;
				}

				// // Check to see if sixth sense procs
				// if (does_it_hit(character.sixth_sense)) {
				// 	current_dist = sharpshooter_bonus(current_dist);
				// }

				// Deal normal damage
				let damage = shot_damage(character.level, atk, current_dist, character.dexterity, stance, character.sheol_promo);
				if (!weapon.piercing) {
					damage -= armor_reduction(enemy.armor);
				}
				results.push({
					damage,
					second,
				});

				// Check to see if fast hand procs
				if (does_it_hit(weapon.fast_hand)) {
					damage = shot_damage(character.level, atk, current_dist, character.dexterity, stance, character.sheol_promo);
					if (!weapon.piercing) {
						damage -= armor_reduction(enemy.armor);
					}
					results.push({
						damage,
						second,
					});
				}

				// Deal strike damage
				if (weapon.strike) {
					damage = strike_damage(
						weapon.min_strike,
						weapon.max_strike,
						enemy.phys_resist,
						max_shot_damage(atk, current_dist, character.dexterity, stance, character.sheol_promo)
					);
					results.push({
						damage,
						second,
					});
				}
			}

			// Update remaining sharpshooter time
			if (sharpshooter_duration > 0) {
				sharpshooter_duration--;
				if (sharpshooter_duration === 0) {
					current_dist = character.base_distance;
				}
			}

			// Update remaining ancient crossbow dot time
			if (weapon.death) {
				if (second >= 2 && second <= 4) {
					weapon.death_tick--;
				}
			}
		}
	}

	return results;
}

// Create a main function to run the simulation
function main()
{
	// Create a character
	const character = new Character(620, 136, 241, 1, 0, 0);

	// Create an enemy
	const enemy = new Enemy(30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

	// Create a weapon
	const weapon = new Weapon("The Annihilator", 34, 4, 0, 10, 20, 9, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

	// Run the simulation
	const results = MediviaDistanceSimulator(10000000, 1, 4, character, weapon, enemy);

	// Print the average damage
	let total_damage = 0;
	let max_damage = 0;
	for (let i = 0; i < results.length; i++) {
		total_damage += results[i].damage;
		if (results[i].damage > max_damage) {
			max_damage = results[i].damage;
		}
	}
	console.log("Average damage: " + total_damage / 10000000);
	console.log("Max damage: " + max_damage);
}

// Run the main function
main();
