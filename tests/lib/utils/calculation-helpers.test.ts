/**
 * Integration Tests for Calculation Helper Functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEmissionsPerEmployee,
  generateBreakdown,
  getEmissionFactorsUsed,
  validateCalculationInputs,
  roundEmissions,
} from '@/lib/utils/calculations';

describe('calculateEmissionsPerEmployee', () => {
  it('should calculate emissions per employee correctly', () => {
    const result = calculateEmissionsPerEmployee(1000, 50);
    expect(result).toBe(20);
  });

  it('should handle decimal values', () => {
    const result = calculateEmissionsPerEmployee(123.45, 7);
    expect(result).toBeCloseTo(17.635714, 4);
  });

  it('should return 0 when employee count is 0', () => {
    const result = calculateEmissionsPerEmployee(1000, 0);
    expect(result).toBe(0);
  });

  it('should handle zero emissions', () => {
    const result = calculateEmissionsPerEmployee(0, 50);
    expect(result).toBe(0);
  });

  it('should handle large numbers', () => {
    const result = calculateEmissionsPerEmployee(1000000, 10000);
    expect(result).toBe(100);
  });
});

describe('generateBreakdown', () => {
  it('should generate breakdown with all categories', () => {
    const breakdown = generateBreakdown(10.5, 5.3, 2.1, 15.7, 8.2);

    expect(breakdown).toEqual({
      fuel: 10.5,
      vehicles: 5.3,
      refrigerants: 2.1,
      electricity: 15.7,
      commuting: 8.2,
    });
  });

  it('should round values to 4 decimal places', () => {
    const breakdown = generateBreakdown(
      10.123456789,
      5.987654321,
      2.555555555,
      15.999999999,
      8.111111111
    );

    expect(breakdown.fuel).toBe(10.1235);
    expect(breakdown.vehicles).toBe(5.9877);
    expect(breakdown.refrigerants).toBe(2.5556);
    expect(breakdown.electricity).toBe(16);
    expect(breakdown.commuting).toBe(8.1111);
  });

  it('should handle zero values', () => {
    const breakdown = generateBreakdown(0, 0, 0, 0, 0);

    expect(breakdown).toEqual({
      fuel: 0,
      vehicles: 0,
      refrigerants: 0,
      electricity: 0,
      commuting: 0,
    });
  });

  it('should handle mixed zero and non-zero values', () => {
    const breakdown = generateBreakdown(10.5, 0, 2.1, 0, 8.2);

    expect(breakdown).toEqual({
      fuel: 10.5,
      vehicles: 0,
      refrigerants: 2.1,
      electricity: 0,
      commuting: 8.2,
    });
  });

  it('should handle very small values', () => {
    const breakdown = generateBreakdown(0.00001, 0.00002, 0.00003, 0.00004, 0.00005);

    expect(breakdown.fuel).toBe(0);
    expect(breakdown.vehicles).toBe(0);
    expect(breakdown.refrigerants).toBe(0);
    expect(breakdown.electricity).toBe(0);
    expect(breakdown.commuting).toBe(0.0001);
  });
});

describe('getEmissionFactorsUsed', () => {
  it('should return factors for all provided fuel types', () => {
    const factors = getEmissionFactorsUsed(['diesel', 'gasoline'], [], []);

    expect(factors.diesel).toBe(0.00269);
    expect(factors.gasoline).toBe(0.00233);
    expect(factors.electricity_ph_grid).toBe(0.00063);
  });

  it('should return factors for all provided refrigerant types', () => {
    const factors = getEmissionFactorsUsed([], ['R_410A', 'R_134a'], []);

    expect(factors.R_410A).toBe(0.002088);
    expect(factors.R_134a).toBe(0.00143);
    expect(factors.electricity_ph_grid).toBe(0.00063);
  });

  it('should return factors for all provided transport modes', () => {
    const factors = getEmissionFactorsUsed([], [], ['car', 'bus', 'bicycle']);

    expect(factors.transport_car).toBe(0.00017);
    expect(factors.transport_bus).toBe(0.00008);
    expect(factors.transport_bicycle).toBe(0);
    expect(factors.electricity_ph_grid).toBe(0.00063);
  });

  it('should return combined factors for all types', () => {
    const factors = getEmissionFactorsUsed(
      ['diesel', 'natural_gas'],
      ['R_410A'],
      ['car', 'walking']
    );

    expect(factors.diesel).toBe(0.00269);
    expect(factors.natural_gas).toBe(0.0021);
    expect(factors.R_410A).toBe(0.002088);
    expect(factors.transport_car).toBe(0.00017);
    expect(factors.transport_walking).toBe(0);
    expect(factors.electricity_ph_grid).toBe(0.00063);
  });

  it('should always include electricity factor', () => {
    const factors = getEmissionFactorsUsed([], [], []);

    expect(factors.electricity_ph_grid).toBe(0.00063);
  });

  it('should skip invalid fuel types', () => {
    const factors = getEmissionFactorsUsed(['invalid_fuel', 'diesel'], [], []);

    expect(factors.invalid_fuel).toBeUndefined();
    expect(factors.diesel).toBe(0.00269);
  });

  it('should handle duplicate types', () => {
    const factors = getEmissionFactorsUsed(['diesel', 'diesel', 'diesel'], [], []);

    expect(factors.diesel).toBe(0.00269);
  });

  it('should handle empty arrays', () => {
    const factors = getEmissionFactorsUsed([], [], []);

    expect(Object.keys(factors)).toEqual(['electricity_ph_grid']);
  });
});

describe('validateCalculationInputs', () => {
  it('should validate positive numbers', () => {
    expect(validateCalculationInputs(10)).toBe(true);
    expect(validateCalculationInputs(0.5)).toBe(true);
    expect(validateCalculationInputs(1000000)).toBe(true);
  });

  it('should validate zero', () => {
    expect(validateCalculationInputs(0)).toBe(true);
  });

  it('should reject negative numbers', () => {
    expect(validateCalculationInputs(-10)).toBe(false);
    expect(validateCalculationInputs(-0.1)).toBe(false);
  });

  it('should reject NaN', () => {
    expect(validateCalculationInputs(NaN)).toBe(false);
    expect(validateCalculationInputs(Number.NaN)).toBe(false);
  });

  it('should reject Infinity', () => {
    expect(validateCalculationInputs(Infinity)).toBe(false);
    expect(validateCalculationInputs(-Infinity)).toBe(false);
  });

  it('should validate very small positive numbers', () => {
    expect(validateCalculationInputs(0.000001)).toBe(true);
  });

  it('should validate very large positive numbers', () => {
    expect(validateCalculationInputs(999999999999)).toBe(true);
  });
});

describe('roundEmissions', () => {
  it('should round to 4 decimal places', () => {
    expect(roundEmissions(1.23456789)).toBe(1.2346);
    expect(roundEmissions(9.87654321)).toBe(9.8765);
  });

  it('should handle values with fewer than 4 decimals', () => {
    expect(roundEmissions(1.2)).toBe(1.2);
    expect(roundEmissions(5.12)).toBe(5.12);
    expect(roundEmissions(3.456)).toBe(3.456);
  });

  it('should handle integers', () => {
    expect(roundEmissions(10)).toBe(10);
    expect(roundEmissions(0)).toBe(0);
  });

  it('should handle very small numbers', () => {
    expect(roundEmissions(0.00001234)).toBe(0);
    expect(roundEmissions(0.00009999)).toBe(0.0001);
  });

  it('should handle very large numbers', () => {
    expect(roundEmissions(123456.789123)).toBe(123456.7891);
  });

  it('should round up when 5th decimal is >= 5', () => {
    expect(roundEmissions(1.23455)).toBe(1.2346);
    expect(roundEmissions(1.23456)).toBe(1.2346);
  });

  it('should round down when 5th decimal is < 5', () => {
    expect(roundEmissions(1.23454)).toBe(1.2345);
    expect(roundEmissions(1.23451)).toBe(1.2345);
  });

  it('should handle negative numbers', () => {
    expect(roundEmissions(-1.23456)).toBe(-1.2346);
    expect(roundEmissions(-9.87654)).toBe(-9.8765);
  });
});

describe('Full calculation workflow integration', () => {
  it('should calculate complete emission record breakdown', () => {
    // Simulate a real emission record calculation

    // Scope 1 - Fuel
    const fuelEmissions = [
      10.5,  // Diesel usage
      5.3,   // Gasoline usage
      2.1,   // Natural gas usage
    ];

    // Scope 1 - Vehicles
    const vehicleEmissions = [
      3.2,   // Vehicle 1
      2.8,   // Vehicle 2
    ];

    // Scope 1 - Refrigerants
    const refrigerantEmissions = [
      0.5,   // R-410A leak
    ];

    // Scope 2 - Electricity
    const electricityEmissions = [
      15.7,  // Facility 1
      12.3,  // Facility 2
    ];

    // Scope 3 - Commuting
    const commutingEmissions = [
      8.2,   // Department 1
      6.5,   // Department 2
    ];

    // Calculate totals
    const fuelTotal = fuelEmissions.reduce((sum, val) => sum + val, 0);
    const vehicleTotal = vehicleEmissions.reduce((sum, val) => sum + val, 0);
    const refrigerantTotal = refrigerantEmissions.reduce((sum, val) => sum + val, 0);
    const electricityTotal = electricityEmissions.reduce((sum, val) => sum + val, 0);
    const commutingTotal = commutingEmissions.reduce((sum, val) => sum + val, 0);

    const totalScope1 = fuelTotal + vehicleTotal + refrigerantTotal;
    const totalScope2 = electricityTotal;
    const totalScope3 = commutingTotal;
    const totalCo2e = totalScope1 + totalScope2 + totalScope3;

    // Generate breakdown
    const breakdown = generateBreakdown(
      fuelTotal,
      vehicleTotal,
      refrigerantTotal,
      electricityTotal,
      commutingTotal
    );

    // Calculate per employee
    const totalEmployees = 100;
    const perEmployee = calculateEmissionsPerEmployee(totalCo2e, totalEmployees);

    // Validate all values
    expect(validateCalculationInputs(totalCo2e)).toBe(true);
    expect(validateCalculationInputs(perEmployee)).toBe(true);

    // Round final values
    const roundedTotal = roundEmissions(totalCo2e);
    const roundedPerEmployee = roundEmissions(perEmployee);

    // Verify calculations
    expect(totalScope1).toBeCloseTo(24.4, 2);
    expect(totalScope2).toBeCloseTo(28, 2);
    expect(totalScope3).toBeCloseTo(14.7, 2);
    expect(roundedTotal).toBeCloseTo(67.1, 2);
    expect(roundedPerEmployee).toBeCloseTo(0.671, 3);

    expect(breakdown).toEqual({
      fuel: 17.9,
      vehicles: 6,
      refrigerants: 0.5,
      electricity: 28,
      commuting: 14.7,
    });
  });

  it('should handle edge case with zero emissions', () => {
    const breakdown = generateBreakdown(0, 0, 0, 0, 0);
    const perEmployee = calculateEmissionsPerEmployee(0, 50);
    const factors = getEmissionFactorsUsed([], [], []);

    expect(breakdown).toEqual({
      fuel: 0,
      vehicles: 0,
      refrigerants: 0,
      electricity: 0,
      commuting: 0,
    });
    expect(perEmployee).toBe(0);
    expect(factors.electricity_ph_grid).toBe(0.00063);
    expect(validateCalculationInputs(0)).toBe(true);
    expect(roundEmissions(0)).toBe(0);
  });

  it('should handle very small emissions accurately', () => {
    const fuelTotal = 0.00123;
    const vehicleTotal = 0.00456;
    const refrigerantTotal = 0.00078;
    const electricityTotal = 0.00234;
    const commutingTotal = 0.00567;

    const breakdown = generateBreakdown(
      fuelTotal,
      vehicleTotal,
      refrigerantTotal,
      electricityTotal,
      commutingTotal
    );

    const totalCo2e = fuelTotal + vehicleTotal + refrigerantTotal + electricityTotal + commutingTotal;
    const rounded = roundEmissions(totalCo2e);

    expect(rounded).toBeCloseTo(0.0146, 4);
    expect(breakdown.fuel).toBe(0.0012);
    expect(breakdown.vehicles).toBe(0.0046);
    expect(breakdown.refrigerants).toBe(0.0008);
    expect(breakdown.electricity).toBe(0.0023);
    expect(breakdown.commuting).toBe(0.0057);
  });
});
