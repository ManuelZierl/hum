import { generateMnemonic as bip39GenerateMnemonic } from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english';
import { randomBytes } from '@noble/hashes/utils';

const WORDLIST = [...englishWordlist];

const PRESET_MNEMONICS: Record<number, string[]> = {
  12: [
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    'legal winner thank year wave sausage worth useful legal winner thank yellow',
    'letter advice cage absurd amount doctor acoustic avoid letter advice cage above',
    'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong',
  ],
};
  }

  const strength = (length / 3) * 32;
  return bip39GenerateMnemonic(englishWordlist, strength);
}

export { WORDLIST };
