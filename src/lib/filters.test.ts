import cases from '@/data/cases';
import infractions from '@/data/infractions';
import { isActiveCase, isHistoricalCase, isHistoricalInfraction, isOpenInfraction } from './filters';

describe('case filters', () => {
  it('partitions cases into active and historical', () => {
    const active = cases.filter(isActiveCase).map((c) => c.id);
    const history = cases.filter(isHistoricalCase).map((c) => c.id);
    expect(active).toEqual(['1', '2', '5']);
    expect(history).toEqual(['3', '4', '6', '7']);
  });
});

describe('infraction filters', () => {
  it('partitions infractions into open and historical', () => {
    expect(infractions.filter(isOpenInfraction).map((i) => i.id)).toEqual(['1', '2']);
    expect(infractions.filter(isHistoricalInfraction)).toHaveLength(infractions.length - 2);
  });
});
