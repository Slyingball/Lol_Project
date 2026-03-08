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
import './galio';
import './irelia';
import './yone';
import './aatrox';
import './akali';
import './akshan';
import './alistar';
import './ambessa';
import './amumu';
import './anivia';
import './annie';
import './aphelios';
import './ashe';
import './aurelionsol';
import './bard';
import './belveth';
import './blitzcrank';
import './brand';
import './braum';
import './briar';
import './caitlyn';
import './camille';
import './cassiopeia';
import './chogath';

// Re-export registry utilities
export { getChampionConfig, hasChampionConfig, getRegisteredChampionIds } from './registry';
export type { ChampionAbilityConfig, SpellSlotConfig, AbilityCalcParams } from './registry';
