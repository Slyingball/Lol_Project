/**
 * Champion index — import all champions to register them.
 * Add new `import` lines here to register more champions.
 */
import './garen';
import './darius';
import './jinx';
import './ahri';
import './lux';
import './zed';
import './leesin';
import './yasuo';

// Re-export registry utilities
export { getChampionConfig, hasChampionConfig, getRegisteredChampionIds } from './registry';
export type { ChampionAbilityConfig, SpellSlotConfig, AbilityCalcParams } from './registry';
