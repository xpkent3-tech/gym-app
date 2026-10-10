import { bodyBack } from 'react-native-body-highlighter/dist/assets/bodyBack';
import { bodyFemaleBack } from 'react-native-body-highlighter/dist/assets/bodyFemaleBack';
import { bodyFemaleFront } from 'react-native-body-highlighter/dist/assets/bodyFemaleFront';
import { bodyFront } from 'react-native-body-highlighter/dist/assets/bodyFront';

import { MUSCLE_SLUG } from '../../components/BodyMap';
import { MUSCLES } from '../muscles';

describe('anatomy mapping', () => {
  it('every visible muscle maps to a region in both male and female artwork', () => {
    const male = new Set([...bodyFront, ...bodyBack].map((p) => p.slug));
    const female = new Set([...bodyFemaleFront, ...bodyFemaleBack].map((p) => p.slug));
    for (const m of MUSCLES) {
      const slug = MUSCLE_SLUG[m.id];
      if (m.deep) {
        expect(slug).toBeNull();
        continue;
      }
      expect(male.has(slug!)).toBe(true);
      expect(female.has(slug!)).toBe(true);
    }
  });
});
