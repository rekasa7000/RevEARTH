/**
 * Unit Tests for Emission Factors
 */

import { describe, it, expect } from 'vitest';
import {
  EMISSION_FACTORS,
  getFuelEmissionFactor,
  getRefrigerantEmissionFactor,
  getElectricityEmissionFactor,
  getTransportEmissionFactor,
} from '@/lib/constants/emission-factors';

describe('EMISSION_FACTORS constants', () => {
  describe('Scope 1 - Fuels', () => {
    it('should have correct fuel emission factors', () => {
      expect(EMISSION_FACTORS.scope1.fuels.natural_gas.factor).toBe(0.0021);
      expect(EMISSION_FACTORS.scope1.fuels.heating_oil.factor).toBe(0.00274);
      expect(EMISSION_FACTORS.scope1.fuels.propane.factor).toBe(0.00163);
      expect(EMISSION_FACTORS.scope1.fuels.diesel.factor).toBe(0.00269);
      expect(EMISSION_FACTORS.scope1.fuels.gasoline.factor).toBe(0.00233);
    });

    it('should have correct fuel units', () => {
      expect(EMISSION_FACTORS.scope1.fuels.natural_gas.unit).toBe('cubic_meters');
      expect(EMISSION_FACTORS.scope1.fuels.heating_oil.unit).toBe('liters');
      expect(EMISSION_FACTORS.scope1.fuels.propane.unit).toBe('kg');
      expect(EMISSION_FACTORS.scope1.fuels.diesel.unit).toBe('liters');
      expect(EMISSION_FACTORS.scope1.fuels.gasoline.unit).toBe('liters');
    });

    it('should have sources for all fuels', () => {
      const fuels = Object.values(EMISSION_FACTORS.scope1.fuels);
      fuels.forEach(fuel => {
        expect(fuel.source).toBeTruthy();
        expect(fuel.description).toBeTruthy();
      });
    });
  });

  describe('Scope 1 - Refrigerants', () => {
    it('should have correct refrigerant emission factors', () => {
      expect(EMISSION_FACTORS.scope1.refrigerants.R_410A.factor).toBe(0.002088);
      expect(EMISSION_FACTORS.scope1.refrigerants.R_134a.factor).toBe(0.00143);
      expect(EMISSION_FACTORS.scope1.refrigerants.R_32.factor).toBe(0.000675);
      expect(EMISSION_FACTORS.scope1.refrigerants.R_404A.factor).toBe(0.003922);
    });

    it('should have correct GWP values', () => {
      expect(EMISSION_FACTORS.scope1.refrigerants.R_410A.gwp).toBe(2088);
      expect(EMISSION_FACTORS.scope1.refrigerants.R_134a.gwp).toBe(1430);
      expect(EMISSION_FACTORS.scope1.refrigerants.R_32.gwp).toBe(675);
      expect(EMISSION_FACTORS.scope1.refrigerants.R_404A.gwp).toBe(3922);
    });

    it('should have GWP matching factor calculation', () => {
      const refrigerants = Object.values(EMISSION_FACTORS.scope1.refrigerants);
      refrigerants.forEach(refrigerant => {
        expect(refrigerant.factor).toBe(refrigerant.gwp / 1000000);
      });
    });

    it('should have all refrigerants with kg unit', () => {
      const refrigerants = Object.values(EMISSION_FACTORS.scope1.refrigerants);
      refrigerants.forEach(refrigerant => {
        expect(refrigerant.unit).toBe('kg');
      });
    });
  });

  describe('Scope 2 - Electricity', () => {
    it('should have correct electricity emission factors', () => {
      expect(EMISSION_FACTORS.scope2.electricity.ph_grid_average.factor).toBe(0.00063);
      expect(EMISSION_FACTORS.scope2.electricity.luzon_grid.factor).toBe(0.00065);
      expect(EMISSION_FACTORS.scope2.electricity.visayas_grid.factor).toBe(0.00061);
      expect(EMISSION_FACTORS.scope2.electricity.mindanao_grid.factor).toBe(0.00058);
    });

    it('should have all electricity with kwh unit', () => {
      const grids = Object.values(EMISSION_FACTORS.scope2.electricity);
      grids.forEach(grid => {
        expect(grid.unit).toBe('kwh');
      });
    });

    it('should have Philippine DOE as source', () => {
      const grids = Object.values(EMISSION_FACTORS.scope2.electricity);
      grids.forEach(grid => {
        expect(grid.source).toContain('Philippine');
      });
    });
  });

  describe('Scope 3 - Commuting', () => {
    it('should have correct transport emission factors', () => {
      expect(EMISSION_FACTORS.scope3.commuting.car.factor).toBe(0.00017);
      expect(EMISSION_FACTORS.scope3.commuting.motorcycle.factor).toBe(0.0001);
      expect(EMISSION_FACTORS.scope3.commuting.bus.factor).toBe(0.00008);
      expect(EMISSION_FACTORS.scope3.commuting.jeepney.factor).toBe(0.00009);
      expect(EMISSION_FACTORS.scope3.commuting.train.factor).toBe(0.00004);
      expect(EMISSION_FACTORS.scope3.commuting.bicycle.factor).toBe(0);
      expect(EMISSION_FACTORS.scope3.commuting.walking.factor).toBe(0);
    });

    it('should have zero emissions for active transport', () => {
      expect(EMISSION_FACTORS.scope3.commuting.bicycle.factor).toBe(0);
      expect(EMISSION_FACTORS.scope3.commuting.walking.factor).toBe(0);
    });

    it('should have all transport modes with km unit', () => {
      const modes = Object.values(EMISSION_FACTORS.scope3.commuting);
      modes.forEach(mode => {
        expect(mode.unit).toBe('km');
      });
    });
  });
});

describe('getFuelEmissionFactor', () => {
  it('should return correct factor for natural gas', () => {
    expect(getFuelEmissionFactor('natural_gas')).toBe(0.0021);
  });

  it('should return correct factor for heating oil', () => {
    expect(getFuelEmissionFactor('heating_oil')).toBe(0.00274);
  });

  it('should return correct factor for propane', () => {
    expect(getFuelEmissionFactor('propane')).toBe(0.00163);
  });

  it('should return correct factor for diesel', () => {
    expect(getFuelEmissionFactor('diesel')).toBe(0.00269);
  });

  it('should return correct factor for gasoline', () => {
    expect(getFuelEmissionFactor('gasoline')).toBe(0.00233);
  });

  it('should return 0 for invalid fuel type', () => {
    expect(getFuelEmissionFactor('invalid_fuel')).toBe(0);
  });

  it('should return 0 for empty string', () => {
    expect(getFuelEmissionFactor('')).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(getFuelEmissionFactor(undefined as any)).toBe(0);
  });
});

describe('getRefrigerantEmissionFactor', () => {
  it('should return correct factor for R-410A', () => {
    expect(getRefrigerantEmissionFactor('R_410A')).toBe(0.002088);
  });

  it('should return correct factor for R-134a', () => {
    expect(getRefrigerantEmissionFactor('R_134a')).toBe(0.00143);
  });

  it('should return correct factor for R-32', () => {
    expect(getRefrigerantEmissionFactor('R_32')).toBe(0.000675);
  });

  it('should return correct factor for R-404A', () => {
    expect(getRefrigerantEmissionFactor('R_404A')).toBe(0.003922);
  });

  it('should return 0 for invalid refrigerant type', () => {
    expect(getRefrigerantEmissionFactor('invalid_refrigerant')).toBe(0);
  });

  it('should return 0 for empty string', () => {
    expect(getRefrigerantEmissionFactor('')).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(getRefrigerantEmissionFactor(undefined as any)).toBe(0);
  });
});

describe('getElectricityEmissionFactor', () => {
  it('should return PH grid average by default', () => {
    expect(getElectricityEmissionFactor()).toBe(0.00063);
  });

  it('should return correct factor for ph_grid_average', () => {
    expect(getElectricityEmissionFactor('ph_grid_average')).toBe(0.00063);
  });

  it('should return correct factor for luzon_grid', () => {
    expect(getElectricityEmissionFactor('luzon_grid')).toBe(0.00065);
  });

  it('should return correct factor for visayas_grid', () => {
    expect(getElectricityEmissionFactor('visayas_grid')).toBe(0.00061);
  });

  it('should return correct factor for mindanao_grid', () => {
    expect(getElectricityEmissionFactor('mindanao_grid')).toBe(0.00058);
  });

  it('should return default factor for invalid grid type', () => {
    expect(getElectricityEmissionFactor('invalid_grid')).toBe(0.00063);
  });

  it('should return default factor for empty string', () => {
    expect(getElectricityEmissionFactor('')).toBe(0.00063);
  });

  it('should return default factor for undefined', () => {
    expect(getElectricityEmissionFactor(undefined)).toBe(0.00063);
  });
});

describe('getTransportEmissionFactor', () => {
  it('should return correct factor for car', () => {
    expect(getTransportEmissionFactor('car')).toBe(0.00017);
  });

  it('should return correct factor for motorcycle', () => {
    expect(getTransportEmissionFactor('motorcycle')).toBe(0.0001);
  });

  it('should return correct factor for bus', () => {
    expect(getTransportEmissionFactor('bus')).toBe(0.00008);
  });

  it('should return correct factor for jeepney', () => {
    expect(getTransportEmissionFactor('jeepney')).toBe(0.00009);
  });

  it('should return correct factor for train', () => {
    expect(getTransportEmissionFactor('train')).toBe(0.00004);
  });

  it('should return 0 for bicycle', () => {
    expect(getTransportEmissionFactor('bicycle')).toBe(0);
  });

  it('should return 0 for walking', () => {
    expect(getTransportEmissionFactor('walking')).toBe(0);
  });

  it('should return 0 for invalid transport mode', () => {
    expect(getTransportEmissionFactor('invalid_mode')).toBe(0);
  });

  it('should return 0 for empty string', () => {
    expect(getTransportEmissionFactor('')).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(getTransportEmissionFactor(undefined as any)).toBe(0);
  });
});

describe('Emission factor validation', () => {
  it('should have all fuel factors as positive numbers', () => {
    const fuels = Object.values(EMISSION_FACTORS.scope1.fuels);
    fuels.forEach(fuel => {
      expect(fuel.factor).toBeGreaterThan(0);
      expect(typeof fuel.factor).toBe('number');
    });
  });

  it('should have all refrigerant factors as positive numbers', () => {
    const refrigerants = Object.values(EMISSION_FACTORS.scope1.refrigerants);
    refrigerants.forEach(refrigerant => {
      expect(refrigerant.factor).toBeGreaterThan(0);
      expect(typeof refrigerant.factor).toBe('number');
    });
  });

  it('should have all electricity factors as positive numbers', () => {
    const grids = Object.values(EMISSION_FACTORS.scope2.electricity);
    grids.forEach(grid => {
      expect(grid.factor).toBeGreaterThan(0);
      expect(typeof grid.factor).toBe('number');
    });
  });

  it('should have all transport factors as non-negative numbers', () => {
    const modes = Object.values(EMISSION_FACTORS.scope3.commuting);
    modes.forEach(mode => {
      expect(mode.factor).toBeGreaterThanOrEqual(0);
      expect(typeof mode.factor).toBe('number');
    });
  });
});
