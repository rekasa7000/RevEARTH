/**
 * Unit Tests for Calculation Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFuelEmissions,
  calculateVehicleEmissions,
  calculateRefrigerantEmissions,
  calculateElectricityEmissions,
  calculateCommutingEmissions,
  calculateScope1Total,
  calculateScope2Total,
  calculateScope3Total,
} from '@/lib/utils/calculations';

describe('calculateFuelEmissions', () => {
  it('should calculate diesel emissions correctly', () => {
    const result = calculateFuelEmissions('diesel', 1000);
    // 1000 liters × 0.00269 tCO2e/liter = 2.69 tCO2e
    expect(result).toBeCloseTo(2.69, 2);
  });

  it('should calculate gasoline emissions correctly', () => {
    const result = calculateFuelEmissions('gasoline', 500);
    // 500 liters × 0.00233 tCO2e/liter = 1.165 tCO2e
    expect(result).toBeCloseTo(1.165, 3);
  });

  it('should calculate natural gas emissions correctly', () => {
    const result = calculateFuelEmissions('natural_gas', 2000);
    // 2000 m³ × 0.0021 tCO2e/m³ = 4.2 tCO2e
    expect(result).toBeCloseTo(4.2, 2);
  });

  it('should handle zero quantity', () => {
    const result = calculateFuelEmissions('diesel', 0);
    expect(result).toBe(0);
  });

  it('should handle decimal quantities', () => {
    const result = calculateFuelEmissions('gasoline', 123.45);
    expect(result).toBeCloseTo(123.45 * 0.00233, 4);
  });

  it('should return 0 for invalid fuel type', () => {
    const result = calculateFuelEmissions('invalid_fuel', 100);
    expect(result).toBe(0);
  });
});

describe('calculateVehicleEmissions', () => {
  it('should calculate vehicle diesel emissions', () => {
    const result = calculateVehicleEmissions('diesel', 250);
    expect(result).toBeCloseTo(250 * 0.00269, 3);
  });

  it('should calculate vehicle gasoline emissions', () => {
    const result = calculateVehicleEmissions('gasoline', 150);
    expect(result).toBeCloseTo(150 * 0.00233, 3);
  });

  it('should handle zero fuel consumption', () => {
    const result = calculateVehicleEmissions('diesel', 0);
    expect(result).toBe(0);
  });
});

describe('calculateRefrigerantEmissions', () => {
  it('should calculate R-410A emissions correctly', () => {
    const result = calculateRefrigerantEmissions('R_410A', 10);
    // 10 kg × 0.002088 tCO2e/kg = 0.02088 tCO2e
    expect(result).toBeCloseTo(0.02088, 5);
  });

  it('should calculate R-134a emissions correctly', () => {
    const result = calculateRefrigerantEmissions('R_134a', 5);
    // 5 kg × 0.00143 tCO2e/kg = 0.00715 tCO2e
    expect(result).toBeCloseTo(0.00715, 5);
  });

  it('should calculate R-32 emissions correctly', () => {
    const result = calculateRefrigerantEmissions('R_32', 8);
    // 8 kg × 0.000675 tCO2e/kg = 0.0054 tCO2e
    expect(result).toBeCloseTo(0.0054, 5);
  });

  it('should calculate R-404A emissions correctly', () => {
    const result = calculateRefrigerantEmissions('R_404A', 3);
    // 3 kg × 0.003922 tCO2e/kg = 0.011766 tCO2e
    expect(result).toBeCloseTo(0.011766, 6);
  });

  it('should handle zero quantity', () => {
    const result = calculateRefrigerantEmissions('R_410A', 0);
    expect(result).toBe(0);
  });

  it('should return 0 for invalid refrigerant type', () => {
    const result = calculateRefrigerantEmissions('invalid_ref', 5);
    expect(result).toBe(0);
  });
});

describe('calculateElectricityEmissions', () => {
  it('should calculate emissions with default grid factor', () => {
    const result = calculateElectricityEmissions(10000);
    // 10000 kWh × 0.00063 tCO2e/kWh = 6.3 tCO2e
    expect(result).toBeCloseTo(6.3, 2);
  });

  it('should calculate emissions with Luzon grid factor', () => {
    const result = calculateElectricityEmissions(5000, 'luzon_grid');
    // 5000 kWh × 0.00065 tCO2e/kWh = 3.25 tCO2e
    expect(result).toBeCloseTo(3.25, 2);
  });

  it('should calculate emissions with Visayas grid factor', () => {
    const result = calculateElectricityEmissions(8000, 'visayas_grid');
    // 8000 kWh × 0.00061 tCO2e/kWh = 4.88 tCO2e
    expect(result).toBeCloseTo(4.88, 2);
  });

  it('should calculate emissions with Mindanao grid factor', () => {
    const result = calculateElectricityEmissions(6000, 'mindanao_grid');
    // 6000 kWh × 0.00058 tCO2e/kWh = 3.48 tCO2e
    expect(result).toBeCloseTo(3.48, 2);
  });

  it('should handle zero consumption', () => {
    const result = calculateElectricityEmissions(0);
    expect(result).toBe(0);
  });

  it('should use default factor for invalid grid type', () => {
    const result = calculateElectricityEmissions(1000, 'invalid_grid');
    // Should use default ph_grid_average factor
    expect(result).toBeCloseTo(0.63, 2);
  });
});

describe('calculateCommutingEmissions', () => {
  it('should calculate car commuting emissions correctly', () => {
    // 50 employees, 10km avg distance, car, 5 days/week, 0 WFH days
    const result = calculateCommutingEmissions(50, 10, 'car', 5, 0);
    // Work days per year: 5 × 52 = 260
    // Annual: 50 × 10 × 2 (round trip) × 0.00017 (factor) × 260 = 44.2 tCO2e
    // Monthly: 44.2 / 12 = 3.683 tCO2e
    expect(result).toBeCloseTo(3.683, 2);
  });

  it('should calculate bus commuting emissions correctly', () => {
    // 100 employees, 15km, bus, 5 days/week, 0 WFH days
    const result = calculateCommutingEmissions(100, 15, 'bus', 5, 0);
    // Work days: 260
    // Annual: 100 × 15 × 2 × 0.00008 (factor) × 260 = 62.4 tCO2e
    // Monthly: 62.4 / 12 = 5.2 tCO2e
    expect(result).toBeCloseTo(5.2, 2);
  });

  it('should account for work-from-home days', () => {
    // 50 employees, 10km, car, 5 days/week, 2 WFH days/week
    const result = calculateCommutingEmissions(50, 10, 'car', 5, 2);
    // Work days: (5 × 52) - (2 × 52) = 156
    // Annual: 50 × 10 × 2 × 0.00017 × 156 = 26.52 tCO2e
    // Monthly: 26.52 / 12 = 2.21 tCO2e
    expect(result).toBeCloseTo(2.21, 2);
  });

  it('should handle bicycle (zero emissions)', () => {
    const result = calculateCommutingEmissions(20, 5, 'bicycle', 5, 0);
    expect(result).toBe(0);
  });

  it('should handle walking (zero emissions)', () => {
    const result = calculateCommutingEmissions(30, 2, 'walking', 5, 0);
    expect(result).toBe(0);
  });

  it('should handle zero employees', () => {
    const result = calculateCommutingEmissions(0, 10, 'car', 5, 0);
    expect(result).toBe(0);
  });

  it('should handle zero distance', () => {
    const result = calculateCommutingEmissions(50, 0, 'car', 5, 0);
    expect(result).toBe(0);
  });

  it('should return 0 for invalid transport mode', () => {
    const result = calculateCommutingEmissions(50, 10, 'invalid_mode', 5, 0);
    expect(result).toBe(0);
  });
});

describe('calculateScope1Total', () => {
  it('should sum all scope 1 emissions', () => {
    const fuelEmissions = [2.5, 3.2, 1.8];
    const vehicleEmissions = [4.5, 2.1];
    const refrigerantEmissions = [0.5];

    const result = calculateScope1Total(
      fuelEmissions,
      vehicleEmissions,
      refrigerantEmissions
    );

    // Total: 2.5 + 3.2 + 1.8 + 4.5 + 2.1 + 0.5 = 14.6
    expect(result).toBeCloseTo(14.6, 2);
  });

  it('should handle empty arrays', () => {
    const result = calculateScope1Total([], [], []);
    expect(result).toBe(0);
  });

  it('should handle mixed empty and filled arrays', () => {
    const result = calculateScope1Total([5.5], [], [2.2]);
    expect(result).toBeCloseTo(7.7, 2);
  });
});

describe('calculateScope2Total', () => {
  it('should sum all electricity emissions', () => {
    const electricityEmissions = [10.5, 8.3, 12.7, 6.1];
    const result = calculateScope2Total(electricityEmissions);
    // Total: 10.5 + 8.3 + 12.7 + 6.1 = 37.6
    expect(result).toBeCloseTo(37.6, 2);
  });

  it('should handle empty array', () => {
    const result = calculateScope2Total([]);
    expect(result).toBe(0);
  });

  it('should handle single value', () => {
    const result = calculateScope2Total([15.5]);
    expect(result).toBe(15.5);
  });
});

describe('calculateScope3Total', () => {
  it('should sum all commuting emissions', () => {
    const commutingEmissions = [4.5, 3.2, 5.8];
    const result = calculateScope3Total(commutingEmissions);
    // Total: 4.5 + 3.2 + 5.8 = 13.5
    expect(result).toBeCloseTo(13.5, 2);
  });

  it('should handle empty array', () => {
    const result = calculateScope3Total([]);
    expect(result).toBe(0);
  });
});
