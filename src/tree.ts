export type Destructible = {
  max_hp: number;
  current_hp: number;
  material: Material;
};

export type Material = "Wood" | "Iron" | "Stone" | "Flesh" | "Etherial";

export type Tool = Destructible;

export type PhysicalEntity = Destructible;

type SentientBeing = {
  body_parts: Destructible[];
};

/**

BodyPart = Destructible & Name

Humanoid = { 
    body_parts: BodyPart[],
    wearables:
        Garment -> Hat, Helmet, Cuirass, Jacket, Robe, Trousers, Sandals, Boots
        Ornament -> Ring, Necklace
        Handheld -> Sword, Axe, Bow, Shield, Wand, Spear, Pickaxe, Sickle, Dagger, Hammer
}

Examples of damage types of physical entities:
Arrow, Dagger, Spear - Piecing
Sword, Axe, Sickle - Slashing
Wand, Hammer, Shield, Fist, Stone - Bludgeoning
EnergyWeapon/EnergySpell - Energy

DerivedHumanoidParameters = {
    max_walking_speed: float,
    max_running_speed: float,
    max_attack_speed: float,
    max_stamina: float,
}

Material protection (factor)
- Wood Piecing(0.5) Slashing(1) Bludgeoning(1) Energy(0.2)
- Iron Piecing(0.5, 0.01) Slashing(1, 0.2) Bludgeoning(1, 0.01) Energy(1, 0)
- Stone Piecing(0.5, 0.01) Slashing(1, 0.01) Bludgeoning(2, 0.2) Energy(0.2, 0)
- Etherial Piecing(1, 0) Slashing(1, 0) Bludgeoning(1, 0) Energy(1, 0)
- Flash Piecing(1, 0.2) Slashing(1, 0.2) Bludgeoning(1, 0.2) Energy(1, 0.2)

Weapon:
    quality: Quality(float)
    weapon_blueprint: WeaponBlueprint

WeaponBlueprint:
    damage_type: DamageType(string)
    double_handed: boolean
    resources: Resource[]



const human = {
    body_parts: [
        {
            max_hp: 100,
            current_hp: 100,
            material: "Wood",
        }
    ],
    wearables: [
        {

*/
