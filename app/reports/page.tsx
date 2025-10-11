import { Card } from "@/components/ui/card";
import React from "react";

export default function Reports() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Emissions Summary
        </h1>
      </div>

      <div>
        <div>
          <h1>ABC Companys Total Estimated Greenhouse Gas Emissions is:</h1>
          <Card>1000</Card>
        </div>
      </div>

      <div>
        <div>
          <div>Chart</div>
        </div>
        <div>
          <div>Numeric Summary</div>
          <div>Graph Summary</div>
        </div>
      </div>
    </div>
  );
}
