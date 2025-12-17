import adminApiClient from '../adminApiClient';

interface AdminPlanFeature {
  name: string;
}

interface AdminPlan {
  id: string;
  name: string;
  description?: string | null;
  currency?: string;
  monthlyPrice?: number;
  yearlyPrice?: number | null;
  posType?: string;
  billingCycle?: string | null;
  features?: AdminPlanFeature[];
  active?: boolean;
}

interface AdminPlansResponse {
  success: boolean;
  count: number;
  plans: AdminPlan[];
}

// Fetch all active restaurant plans from admin backend
export const fetchPlans = async (): Promise<AdminPlan[]> => {
  try {
    const response = await adminApiClient.get<AdminPlansResponse>(
      'api/admin/pricing-plans',
      {
        params: {
          posType: 'restaurant',
          active: true,
        },
      }
    );

    // admin backend returns { success, count, plans }
    return response.data?.plans || [];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
};

// Fetch a specific plan by ID (if needed)
export const fetchPlanById = async (
  planId: string
): Promise<AdminPlan | null> => {
  try {
    const response = await adminApiClient.get<{ success: boolean; plan: AdminPlan }>(
      `/admin/pricing-plans/${planId}`
    );
    return response.data?.plan || null;
  } catch (error) {
    console.error(`Error fetching plan ${planId}:`, error);
    return null;
  }
};

// Format plans for display in SignupScreen
export const formatPlansForDisplay = (plans: AdminPlan[]) => {
  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description || '',
    monthlyPrice:
      typeof plan.monthlyPrice === 'number' ? plan.monthlyPrice : 0,
    currency: plan.currency || '₹',
    period: plan.billingCycle
      ? plan.billingCycle.toLowerCase()
      : 'per month',
    features: plan.features?.map((f) => f.name) ?? [],
    featureHighlights: [],
    allowedModules: [],
    popular: false,
    color: 'from-emerald-500 to-emerald-700',
  }));
};
