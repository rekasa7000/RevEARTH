import { prisma } from "@/lib/db";
import {
  calculateFuelEmissions,
  calculateVehicleEmissions,
  calculateRefrigerantEmissions,
  calculateElectricityEmissions,
  calculateCommutingEmissions,
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
    const fuelEmissions: number[] = [];
    const fuelTypes: string[] = [];

    for (const fuel of record.fuelUsage) {
      const co2e = calculateFuelEmissions(fuel.fuelType, parseFloat(fuel.quantity.toString()));
      fuelEmissions.push(co2e);
      fuelTypes.push(fuel.fuelType);

      // Update fuel usage with calculated emissions
      await prisma.fuelUsage.update({
        where: { id: fuel.id },
        data: { co2eCalculated: roundEmissions(co2e) },
      });
    }

    // Calculate Scope 1 - Vehicles
    const vehicleEmissions: number[] = [];
    const vehicleFuelTypes: string[] = [];

    for (const vehicle of record.vehicleUsage) {
      if (vehicle.fuelConsumed) {
        const co2e = calculateVehicleEmissions(
          vehicle.fuelType,
          parseFloat(vehicle.fuelConsumed.toString())
        );
        vehicleEmissions.push(co2e);
        vehicleFuelTypes.push(vehicle.fuelType);

        // Update vehicle usage with calculated emissions
        await prisma.vehicleUsage.update({
          where: { id: vehicle.id },
          data: { co2eCalculated: roundEmissions(co2e) },
        });
      }
    }

    // Calculate Scope 1 - Refrigerants
    const refrigerantEmissions: number[] = [];
    const refrigerantTypes: string[] = [];

    for (const refrigerant of record.refrigerantUsage) {
      if (refrigerant.quantityLeaked) {
        const co2e = calculateRefrigerantEmissions(
          refrigerant.refrigerantType,
          parseFloat(refrigerant.quantityLeaked.toString())
        );
        refrigerantEmissions.push(co2e);
        refrigerantTypes.push(refrigerant.refrigerantType);

        // Update refrigerant usage with calculated emissions
        await prisma.refrigerantUsage.update({
          where: { id: refrigerant.id },
          data: { co2eCalculated: roundEmissions(co2e) },
        });
      }
    }

    // Calculate Scope 2 - Electricity
    const electricityEmissions: number[] = [];

    for (const electricity of record.electricityUsage) {
      const co2e = calculateElectricityEmissions(
        parseFloat(electricity.kwhConsumption.toString())
      );
      electricityEmissions.push(co2e);

      // Update electricity usage with calculated emissions
      await prisma.electricityUsage.update({
        where: { id: electricity.id },
        data: { co2eCalculated: roundEmissions(co2e) },
      });
    }

    // Calculate Scope 3 - Commuting
    const commutingEmissions: number[] = [];
    const transportModes: string[] = [];

    for (const commuting of record.commutingData) {
      if (commuting.avgDistanceKm && commuting.daysPerWeek) {
        const co2e = calculateCommutingEmissions(
          commuting.employeeCount,
          parseFloat(commuting.avgDistanceKm.toString()),
          commuting.transportMode,
          commuting.daysPerWeek,
          commuting.wfhDays || 0
        );
        commutingEmissions.push(co2e);
        transportModes.push(commuting.transportMode);

        // Update commuting data with calculated emissions
        await prisma.commutingData.update({
          where: { id: commuting.id },
          data: { co2eCalculated: roundEmissions(co2e) },
        });
      }
    }

    // Calculate totals
    const fuelTotal = fuelEmissions.reduce((sum, val) => sum + val, 0);
    const vehicleTotal = vehicleEmissions.reduce((sum, val) => sum + val, 0);
    const refrigerantTotal = refrigerantEmissions.reduce((sum, val) => sum + val, 0);
    const electricityTotal = electricityEmissions.reduce((sum, val) => sum + val, 0);
    const commutingTotal = commutingEmissions.reduce((sum, val) => sum + val, 0);

    const totalScope1Co2e = fuelTotal + vehicleTotal + refrigerantTotal;
    const totalScope2Co2e = electricityTotal;
    const totalScope3Co2e = commutingTotal;
    const totalCo2e = totalScope1Co2e + totalScope2Co2e + totalScope3Co2e;

    // Calculate emissions per employee
    const totalEmployees = record.organization.facilities.reduce(
      (sum, facility) => sum + (facility.employeeCount || 0),
      0
    );
    const emissionsPerEmployee = totalEmployees > 0 ? totalCo2e / totalEmployees : 0;

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

    // Upsert calculation result
    const calculation = await prisma.emissionCalculation.upsert({
      where: { emissionRecordId },
      create: {
        emissionRecordId,
        totalScope1Co2e: roundEmissions(totalScope1Co2e),
        totalScope2Co2e: roundEmissions(totalScope2Co2e),
        totalScope3Co2e: roundEmissions(totalScope3Co2e),
        totalCo2e: roundEmissions(totalCo2e),
        breakdownByCategory,
        emissionFactorsUsed,
        emissionsPerEmployee: roundEmissions(emissionsPerEmployee),
      },
      update: {
        totalScope1Co2e: roundEmissions(totalScope1Co2e),
        totalScope2Co2e: roundEmissions(totalScope2Co2e),
        totalScope3Co2e: roundEmissions(totalScope3Co2e),
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
        totalCo2e: roundEmissions(totalCo2e),
        totalScope1Co2e: roundEmissions(totalScope1Co2e),
        totalScope2Co2e: roundEmissions(totalScope2Co2e),
        totalScope3Co2e: roundEmissions(totalScope3Co2e),
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
