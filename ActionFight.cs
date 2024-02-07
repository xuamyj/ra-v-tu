using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Emblem
{
    public class ActionFight
    {
        public static bool canDouble(Unit striker, Unit struck)
        {
            return striker.unitStats.speed >= struck.unitStats.speed + 5;
        }

        public static int calculateHit(Unit striker, Weapon strikerWeapon)
        {
            // Weapon’s Hit rate + [(Skill x 3 + Luck) / 2]
            return strikerWeapon.weaponStats.hit + (striker.unitStats.skill * 3 + striker.unitStats.luck) / 2;
        }

        public static int calculateCrit(Unit striker, Weapon strikerWeapon)
        {
            // Weapon’s Critical + (Skill / 2)
            return strikerWeapon.weaponStats.crit + (striker.unitStats.skill / 2);
        }

        public static int calculateAvoid(Unit avoider)
        {
            // (Speed x 3 + Luck) / 2
            return (avoider.unitStats.speed * 3 + avoider.unitStats.luck) / 2;
        }

        public static int calculateDamage(Unit striker, Weapon strikerWeapon, Unit struck)
        {
            // ignoring weapon rank or weapon triangle bonus and terrain or supports or weapon effectiveness (bows) 
            WeaponDamageType damageType = WeaponTypeMap.weaponDamageTypeMap[strikerWeapon.weaponType];
            int attack = strikerWeapon.weaponStats.damage + (damageType == WeaponDamageType.Physical ? striker.unitStats.str : striker.unitStats.mag);
            int defense = (damageType == WeaponDamageType.Physical ? struck.unitStats.def : struck.unitStats.res);

            Debug.Log(String.Format("weapon dmg {0}, attack {3}, defense {4}", strikerWeapon.weaponStats.damage, striker.unitStats.str, struck.unitStats.def, attack, defense));

            // return 0 if negative
            return Math.Max(attack - defense, 0);
        }

        public static int calculateWeaponTriangleModifier(Weapon strikerWeapon, Weapon struckWeapon)
        {
            WeaponAdvantageStatus status = WeaponColorHelpers.IsWeaponAdvantaged(WeaponTypeMap.weaponColorMap[strikerWeapon.weaponType], WeaponTypeMap.weaponColorMap[struckWeapon.weaponType]);
            if (status == WeaponAdvantageStatus.Advantage)
            {
                return 10;
            } else if (status == WeaponAdvantageStatus.Disadvantage)
            {
                return -10;
            } else
            {
                return 0;
            }
        }


        public static bool didHit(Unit striker, Weapon strikerWeapon, Unit struck, Weapon struckWeapon)
        {
            double randomValue = GlobalRandomManager.Instance.getRandom();

            int strikerHit = calculateHit(striker, strikerWeapon);
            int struckAvoid = calculateAvoid(struck);

            int weaponTriangleModifier = calculateWeaponTriangleModifier(strikerWeapon, struckWeapon);

            return strikerHit + weaponTriangleModifier - struckAvoid > randomValue * 100;

            // ignoring 2rn/friendliness of randomness (90% = 97%, 40% = 15%)
            // ignoring terrain and supports 
        }

        public static bool didCrit(Unit striker, Weapon strikerWeapon, Unit struck)
        {
            double randomValue = GlobalRandomManager.Instance.getRandom();

            int strikerCrit = calculateCrit(striker, strikerWeapon);
            int struckCritAvoid = struck.unitStats.luck;


            return strikerCrit - struckCritAvoid > randomValue * 100;
            // ignoring supports 
        }

        public static void EnqueueForUnit(Unit striker, Weapon strikerWeapon, int distance, Queue<string> strikes)
        {
            // if not in range, then return 
            if (!Array.Exists(strikerWeapon.weaponStats.range,
                (x) => x == distance))
            {
                return;
            }

            String.Format("{0} will attack", striker.id);

            strikes.Enqueue(striker.id);

            // if brave, then enqueue again
        }

        public static void run(Unit attacker, Unit defender, int distance, Weapon attackerWeapon, Weapon defenderWeapon) 
        {
            // currently: attacker amy, defender evander

            Queue<string> strikes = new Queue<string>();

            // attack
            EnqueueForUnit(attacker, attackerWeapon, distance, strikes);
            // defend
            EnqueueForUnit(defender, defenderWeapon, distance, strikes);
            // does anyone double? 
            if (canDouble(attacker, defender))
            {
                EnqueueForUnit(attacker, attackerWeapon, distance, strikes);
            } else if (canDouble(defender, attacker)) {
                EnqueueForUnit(defender, defenderWeapon, distance, strikes);
            } // else nothing

            while (strikes.Count > 0)
            {
                string strikerId = strikes.Dequeue();
                Unit striker = strikerId == attacker.id ? attacker : defender;
                Unit struck = strikerId == attacker.id ? defender : attacker;
                Weapon strikerWeapon = strikerId == attacker.id ? attackerWeapon : defenderWeapon;
                Weapon struckWeapon = strikerId == attacker.id ? defenderWeapon : attackerWeapon;
                Debug.Log(String.Format("{0} attacking with {1}!", striker.id, strikerWeapon.id));

                if (!didHit(striker, strikerWeapon, struck, struckWeapon))
                {
                    Debug.Log(String.Format("{0} missed!", striker.id));
                    continue;
                }

                int damage = calculateDamage(striker, strikerWeapon, struck);
                if (didCrit(striker, strikerWeapon, struck)) // crit
                {
                    Debug.Log(String.Format("{0} crits!", striker.id));
                    damage *= 3;
                }
                
                struck.unitStats.hp -= damage;
                Debug.Log(String.Format("{0} took {1} damage, now at {2} health", struck.id, damage, struck.unitStats.hp));

                if (struck.unitStats.hp <= 0) // died
                {
                    Debug.Log(String.Format("{0} died", struck.id));
                    break;
                }
            }

            Debug.Log(String.Format("End fight between {0} and {1}", attacker.id, defender.id));
        }
    }
}
