async function testTiers() {
    const res = await fetch('https://ddragon.leagueoflegends.com/cdn/14.5.1/data/en_US/item.json');
    const data = await res.json();
    const items = data.data;

    const tiers = { Starter: 0, Consumable: 0, Boots: 0, Basic: 0, Epic: 0, Legendary: 0 };
    
    for (const [id, item] of Object.entries(items)) {
        if (!item.gold.purchasable || !item.maps['11']) continue;
        
        let tier = 'Basic';
        if (item.tags.includes('Consumable')) {
            tier = 'Consumable';
        } else if (item.tags.includes('Boots')) {
            tier = 'Boots';
        } else if (['Doran', 'Starter', 'Jungle', 'Lane'].some(t => item.tags.includes(t)) || (item.gold.total < 500 && item.tags.includes('HealthRegen'))) {
            // Rough heuristic for starter
            // Doran's blade is id 1055, dark seal 1082, etc.
            tier = item.gold.total < 500 && item.depth === undefined ? 'Starter' : 'Basic';
        } else if (item.depth === 1 || item.depth === undefined) {
             tier = 'Basic';
        } else if (item.depth === 2) {
             tier = 'Epic';
        } else if (item.depth >= 3) {
             tier = 'Legendary';
        }

        if (id === '1055') console.log("Doran's Blade tier:", tier, item.tags, item.depth);
        if (id === '3089') console.log("Rabadon tier:", tier, item.tags, item.depth);
        if (id === '3006') console.log("Berserker Greaves tier:", tier, item.tags, item.depth);
    }
}
testTiers().catch(console.error);
