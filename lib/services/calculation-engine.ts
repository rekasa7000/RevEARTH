import { prisma } from "@/lib/db";
import {
  calculateFuelEmissions,
  calculateVehicleEmissions,
  calculateRefrigerantEmissions,
  calculateElectricityEmissions,
  calculateCommutingEmissions,
  calculateScope1Total,
  calculateScope2Total,
  calculateScope3Total,
  generateBreakdown,
  getEmissionFactorsUsed,
  roundEmissions,
} from "@/lib/utils/calculations";

/**
 * Calculate emissions for an entire emission record
 * This is the main calculation engine
 */
export async function calculateEmissionRecord(emissionRecordId: string) {
  try {
    // Fetch emission record with all data
    const record = await prisma.emissionRecord.findUnique({
      where: { id: emissionRecordId },
      include: {
        fuelUsage: true,
        vehicleUsage: true,
        refrigerantUsage: true,
        electricityUsage: true,
        commutingData: true,
        organization: {
          include: {
            facilities: true,
          },
        },
      },
    });

    if (!record) {
      throw new Error("Emission record not found");
    }

    // Calculate Scope 1 - Fuel
    const fuelEmissions: Array<{ co2: number; ch4: number; n2o: number; co2e: number }> = [];
    const fuelTypes: string[] = [];

    for (const fuel of record.fuelUsage) {
      const emissions = calculateFuelEmissions(fuel.fuelType, parseFloat(fuel.quantity.toString()));
      fuelEmissions.push(emissions);
      fuelTypes.push(fuel.fuelType);

      // Update fuel usage with calculated emissions (separate gases)
      await prisma.fuelUsage.update({
        where: { id: fuel.id },
        data: {
          co2Emissions: roundEmissions(emissions.co2),
          ch4Emissions: roundEmissions(emissions.ch4),
          n2oEmissions: roundEmissions(emissions.n2o),
          co2eCalculated: roundEmissions(emissions.co2e),
        },
      });
    }

    // Calculate Scope 1 - Vehicles
    const vehicleEmissions: Array<{ co2: number; ch4: number; n2o: number; co2e: number }> = [];
    const vehicleFuelTypes: string[] = [];

    for (const vehicle of record.vehicleUsage) {
      if (vehicle.fuelConsumed) {
        const emissions = calculateVehicleEmissions(
          vehicle.fuelType,
          parseFloat(vehicle.fuelConsumed.toString())
        );
        vehicleEmissions.push(emissions);
        vehicleFuelTypes.push(vehicle.fuelType);

        // Update vehicle usage with calculated emissions (separate gases)
        await prisma.vehicleUsage.update({
          where: { id: vehicle.id },
          data: {
            co2Emissions: roundEmissions(emissions.co2),
            ch4Emissions: roundEmissions(emissions.ch4),
            n2oEmissions: roundEmissions(emissions.n2o),
            co2eCalculated: roundEmissions(emissions.co2e),
          },
        });
      }
    }

    // Calculate Scope 1 - Refrigerants
    const refrigerantEmissions: Array<{ co2: number; ch4: number; n2o: number; co2e: number }> = [];
    const refrigerantTypes: string[] = [];

    for (const refrigerant of record.refrigerantUsage) {
      if (refrigerant.quantityLeaked) {
        const emissions = calculateRefrigerantEmissions(
          refrigerant.refrigerantType,
          parseFloat(refrigerant.quantityLeaked.toString())
        );
        refrigerantEmissions.push(emissions);
        refrigerantTypes.push(refrigerant.refrigerantType);

        // Update refrigerant usage with calculated emissions (separate gases)
        await prisma.refrigerantUsage.update({
          where: { id: refrigerant.id },
          data: {
            co2Emissions: roundEmissions(emissions.co2),
            ch4Emissions: roundEmissions(emissions.ch4),
            n2oEmissions: roundEmissions(emissions.n2o),
            co2eCalculated: roundEmissions(emissions.co2e),
          },
        });
      }
    }

    // Calculate Scope 2 - Electricity
    const electricityEmissions: Array<{ co2: number; ch4: number; n2o: number; co2e: number }> = [];

    for (const electricity of record.electricityUsage) {
      const emissions = calculateElectricityEmissions(
        parseFloat(electricity.kwhConsumption.toString())
      );
      electricityEmissions.push(emissions);

      // Update electricity usage with calculated emissions (separate gases)
      await prisma.electricityUsage.update({
        where: { id: electricity.id },
        data: {
          co2Emissions: roundEmissions(emissions.co2),
          ch4Emissions: roundEmissions(emissions.ch4),
          n2oEmissions: roundEmissions(emissions.n2o),
          co2eCalculated: roundEmissions(emissions.co2e),
        },
      });
    }

    // Calculate Scope 3 - Commuting
    const commutingEmissions: Array<{ co2: number; ch4: number; n2o: number; co2e: number }> = [];
    const transportModes: string[] = [];

    for (const commuting of record.commutingData) {
      if (commuting.avgDistanceKm && commuting.daysPerWeek) {
        const emissions = calculateCommutingEmissions(
          commuting.employeeCount,
          parseFloat(commuting.avgDistanceKm.toString()),
          commuting.transportMode,
          commuting.daysPerWeek,
          commuting.wfhDays || 0
        );
        commutingEmissions.push(emissions);
        transportModes.push(commuting.transportMode);

        // Update commuting data with calculated emissions (separate gases)
        await prisma.commutingData.update({
          where: { id: commuting.id },
          data: {
            co2Emissions: roundEmissions(emissions.co2),
            ch4Emissions: roundEmissions(emissions.ch4),
            n2oEmissions: roundEmissions(emissions.n2o),
            co2eCalculated: roundEmissions(emissions.co2e),
          },
        });
      }
    }

    // Calculate totals using updated aggregate functions
    const scope1Totals = calculateScope1Total(fuelEmissions, vehicleEmissions, refrigerantEmissions);
    const scope2Totals = calculateScope2Total(electricityEmissions);
    const scope3Totals = calculateScope3Total(commutingEmissions);

    // Calculate grand totals
    const totalCo2 = scope1Totals.co2 + scope2Totals.co2 + scope3Totals.co2;
    const totalCh4 = scope1Totals.ch4 + scope2Totals.ch4 + scope3Totals.ch4;
    const totalN2o = scope1Totals.n2o + scope2Totals.n2o + scope3Totals.n2o;
    const totalCo2e = scope1Totals.co2e + scope2Totals.co2e + scope3Totals.co2e;

    // Calculate emissions per employee
    const totalEmployees = record.organization.facilities.reduce(
      (sum, facility) => sum + (facility.employeeCount || 0),
      0
    );
    const emissionsPerEmployee = totalEmployees > 0 ? totalCo2e / totalEmployees : 0;

    // Calculate individual category totals for breakdown
    const fuelTotal = fuelEmissions.reduce((sum, val) => sum + val.co2e, 0);
    const vehicleTotal = vehicleEmissions.reduce((sum, val) => sum + val.co2e, 0);
    const refrigerantTotal = refrigerantEmissions.reduce((sum, val) => sum + val.co2e, 0);
    const electricityTotal = electricityEmissions.reduce((sum, val) => sum + val.co2e, 0);
    const commutingTotal = commutingEmissions.reduce((sum, val) => sum + val.co2e, 0);

    // Generate breakdown
    const breakdownByCategory = generateBreakdown(
      fuelTotal,
      vehicleTotal,
      refrigerantTotal,
      electricityTotal,
      commutingTotal
    );

    // Get emission factors used
    const emissionFactorsUsed = getEmissionFactorsUsed(
      [...new Set([...fuelTypes, ...vehicleFuelTypes])],
      [...new Set(refrigerantTypes)],
      [...new Set(transportModes)]
    );

    // Upsert calculation result with separate gas totals
    const calculation = await prisma.emissionCalculation.upsert({
      where: { emissionRecordId },
      create: {
        emissionRecordId,
        // Scope 1 separate gases
        totalScope1Co2: roundEmissions(scope1Totals.co2),
        totalScope1Ch4: roundEmissions(scope1Totals.ch4),
        totalScope1N2o: roundEmissions(scope1Totals.n2o),
        totalScope1Co2e: roundEmissions(scope1Totals.co2e),
        // Scope 2 separate gases
        totalScope2Co2: roundEmissions(scope2Totals.co2),
        totalScope2Ch4: roundEmissions(scope2Totals.ch4),
        totalScope2N2o: roundEmissions(scope2Totals.n2o),
        totalScope2Co2e: roundEmissions(scope2Totals.co2e),
        // Scope 3 separate gases
        totalScope3Co2: roundEmissions(scope3Totals.co2),
        totalScope3Ch4: roundEmissions(scope3Totals.ch4),
        totalScope3N2o: roundEmissions(scope3Totals.n2o),
        totalScope3Co2e: roundEmissions(scope3Totals.co2e),
        // Grand totals
        totalCo2: roundEmissions(totalCo2),
        totalCh4: roundEmissions(totalCh4),
        totalN2o: roundEmissions(totalN2o),
        totalCo2e: roundEmissions(totalCo2e),
        breakdownByCategory,
        emissionFactorsUsed,
        emissionsPerEmployee: roundEmissions(emissionsPerEmployee),
      },
      update: {
        // Scope 1 separate gases
        totalScope1Co2: roundEmissions(scope1Totals.co2),
        totalScope1Ch4: roundEmissions(scope1Totals.ch4),
        totalScope1N2o: roundEmissions(scope1Totals.n2o),
        totalScope1Co2e: roundEmissions(scope1Totals.co2e),
        // Scope 2 separate gases
        totalScope2Co2: roundEmissions(scope2Totals.co2),
        totalScope2Ch4: roundEmissions(scope2Totals.ch4),
        totalScope2N2o: roundEmissions(scope2Totals.n2o),
        totalScope2Co2e: roundEmissions(scope2Totals.co2e),
        // Scope 3 separate gases
        totalScope3Co2: roundEmissions(scope3Totals.co2),
        totalScope3Ch4: roundEmissions(scope3Totals.ch4),
        totalScope3N2o: roundEmissions(scope3Totals.n2o),
        totalScope3Co2e: roundEmissions(scope3Totals.co2e),
        // Grand totals
        totalCo2: roundEmissions(totalCo2),
        totalCh4: roundEmissions(totalCh4),
        totalN2o: roundEmissions(totalN2o),
        totalCo2e: roundEmissions(totalCo2e),
        breakdownByCategory,
        emissionFactorsUsed,
        emissionsPerEmployee: roundEmissions(emissionsPerEmployee),
        calculatedAt: new Date(),
      },
    });

    return {
      success: true,
      calculation,
      summary: {
        // Grand totals
        totalCo2: roundEmissions(totalCo2),
        totalCh4: roundEmissions(totalCh4),
        totalN2o: roundEmissions(totalN2o),
        totalCo2e: roundEmissions(totalCo2e),
        // Scope totals
        totalScope1Co2e: roundEmissions(scope1Totals.co2e),
        totalScope2Co2e: roundEmissions(scope2Totals.co2e),
        totalScope3Co2e: roundEmissions(scope3Totals.co2e),
        emissionsPerEmployee: roundEmissions(emissionsPerEmployee),
        breakdownByCategory,
      },
    };
  } catch (error) {
    console.error("Calculation engine error:", error);
    throw error;
  }
}

/**
 * Recalculate emissions for all records of an organization
 */
export async function recalculateOrganizationEmissions(organizationId: string) {
  const records = await prisma.emissionRecord.findMany({
    where: { organizationId },
  });

  const results = [];
  for (const record of records) {
    try {
      const result = await calculateEmissionRecord(record.id);
      results.push({ recordId: record.id, success: true, result });
    } catch (error) {
      results.push({ recordId: record.id, success: false, error });
    }
  }

  return results;
}
