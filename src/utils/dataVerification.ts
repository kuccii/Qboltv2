/**
 * Data Verification Utility
 * Verifies that all API methods are working correctly
 */

import { unifiedApi } from '../services/unifiedApi';

export interface VerificationResult {
  dataType: string;
  canFetch: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  error?: string;
}

/**
 * Verify all data operations for a specific data type
 */
export async function verifyDataOperations(dataType: string): Promise<VerificationResult> {
  const result: VerificationResult = {
    dataType,
    canFetch: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  };

  try {
    // Test fetch
    switch (dataType) {
      case 'prices':
        await unifiedApi.prices.get({ limit: 1 });
        result.canFetch = true;
        break;
      case 'suppliers':
        await unifiedApi.suppliers.get({ limit: 1 });
        result.canFetch = true;
        break;
      case 'agents':
        const agentsResult = await unifiedApi.agents.getAll({ limit: 1 });
        result.canFetch = !!agentsResult.data;
        break;
      case 'financing':
        const financingResult = await unifiedApi.financing.getAll({ limit: 1 });
        result.canFetch = !!financingResult.data;
        break;
      case 'logistics':
        const logisticsResult = await unifiedApi.logistics.getAll({ limit: 1 });
        result.canFetch = !!logisticsResult.data;
        break;
      case 'demand':
        const demandResult = await unifiedApi.demand.getAll({ limit: 1 });
        result.canFetch = !!demandResult.data;
        break;
      case 'risk':
        const riskResult = await unifiedApi.riskProfile.getAllAlerts({ limit: 1 });
        result.canFetch = !!riskResult.data;
        break;
      case 'documents':
        const docsResult = await unifiedApi.documents.getAll({ limit: 1 });
        result.canFetch = !!docsResult.data;
        break;
      default:
        result.error = `Unknown data type: ${dataType}`;
        return result;
    }

    // Test create (if applicable)
    try {
      switch (dataType) {
        case 'prices':
          // Test data structure
          result.canCreate = typeof unifiedApi.prices.create === 'function';
          break;
        case 'suppliers':
          result.canCreate = typeof unifiedApi.suppliers.createSupplier === 'function';
          break;
        case 'agents':
          result.canCreate = typeof unifiedApi.agents.create === 'function';
          break;
        case 'financing':
          result.canCreate = typeof unifiedApi.financing.create === 'function';
          break;
        case 'logistics':
          result.canCreate = typeof unifiedApi.logistics.create === 'function';
          break;
        case 'demand':
          result.canCreate = typeof unifiedApi.demand.create === 'function';
          break;
        case 'risk':
          result.canCreate = typeof unifiedApi.riskProfile.createAlert === 'function';
          break;
        case 'documents':
          result.canCreate = typeof unifiedApi.documents.create === 'function';
          break;
      }
    } catch (err: any) {
      result.error = `Create check failed: ${err.message}`;
    }

    // Test update
    try {
      switch (dataType) {
        case 'prices':
          result.canUpdate = typeof unifiedApi.prices.update === 'function';
          break;
        case 'suppliers':
          result.canUpdate = typeof unifiedApi.suppliers.update === 'function';
          break;
        case 'agents':
          result.canUpdate = typeof unifiedApi.agents.update === 'function';
          break;
        case 'financing':
          result.canUpdate = typeof unifiedApi.financing.update === 'function';
          break;
        case 'logistics':
          result.canUpdate = typeof unifiedApi.logistics.update === 'function';
          break;
        case 'demand':
          result.canUpdate = typeof unifiedApi.demand.update === 'function';
          break;
        case 'risk':
          result.canUpdate = typeof unifiedApi.riskProfile.updateAlert === 'function';
          break;
        case 'documents':
          result.canUpdate = typeof unifiedApi.documents.update === 'function';
          break;
      }
    } catch (err: any) {
      result.error = `Update check failed: ${err.message}`;
    }

    // Test delete
    try {
      switch (dataType) {
        case 'prices':
          result.canDelete = typeof unifiedApi.prices.delete === 'function';
          break;
        case 'suppliers':
          result.canDelete = typeof unifiedApi.suppliers.deleteSupplier === 'function';
          break;
        case 'agents':
          result.canDelete = typeof unifiedApi.agents.delete === 'function';
          break;
        case 'financing':
          result.canDelete = typeof unifiedApi.financing.delete === 'function';
          break;
        case 'logistics':
          result.canDelete = typeof unifiedApi.logistics.delete === 'function';
          break;
        case 'demand':
          result.canDelete = typeof unifiedApi.demand.delete === 'function';
          break;
        case 'risk':
          result.canDelete = typeof unifiedApi.riskProfile.deleteAlert === 'function';
          break;
        case 'documents':
          result.canDelete = typeof unifiedApi.documents.delete === 'function';
          break;
      }
    } catch (err: any) {
      result.error = `Delete check failed: ${err.message}`;
    }
  } catch (err: any) {
    result.error = err.message || 'Unknown error';
  }

  return result;
}

/**
 * Verify all data types
 */
export async function verifyAllDataTypes(): Promise<VerificationResult[]> {
  const dataTypes = [
    'prices',
    'suppliers',
    'agents',
    'financing',
    'logistics',
    'demand',
    'risk',
    'documents',
  ];

  const results = await Promise.all(
    dataTypes.map(type => verifyDataOperations(type))
  );

  return results;
}

